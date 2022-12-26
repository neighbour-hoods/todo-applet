use std::collections::BTreeMap;

use hdk::prelude::*;
use todo_integrity::{EntryTypes, LinkTypes, Task, TaskStatus};

#[hdk_extern]
pub fn get_latest_task(action_hash: ActionHash) -> ExternResult<Option<Task>> {
    match get_details(action_hash.clone(), GetOptions::default())? {
        Some(Details::Record(details)) => {
            match details.updates.len() {
                // pass out the action associated with this entry
                0 => Ok(Some(
                    entry_from_record(details.record)?
                )),
                _ => {
                    let mut sortlist = details.updates.to_vec();
                    // unix timestamp should work for sorting
                    sortlist.sort_by_key(|update| update.action().timestamp().as_millis());
                    // sorts in ascending order, so take the last record
                    let last = sortlist.last().unwrap().to_owned();
                    let hash = last.action_address();
                    match get(hash.clone(), GetOptions::default())? {
                        Some(record) => {
                            Ok(Some(entry_from_record(record)?))
                        }
                        None => Ok(None),
                    }
                }
            }
        }
        _ => Ok(None),
    }
}

#[hdk_extern]
pub fn create_new_list(list_name: String) -> ExternResult<()> {
    list_typed_path(list_name)?.ensure()
}

#[hdk_extern]
pub fn add_task_to_list(
    TaskToListInput {
        task_description,
        list,
    }: TaskToListInput,
) -> ExternResult<ActionHash> {
    let task = Task {
        description: task_description,
        status: TaskStatus::Incomplete,
    };
    let action_hash = create_entry(EntryTypes::Task(task))?;
    create_link(
        list_typed_path(list)?.path_entry_hash()?,
        action_hash.clone(),
        LinkTypes::ListToTask,
        (),
    )?;
    Ok(action_hash)
}

#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub struct TaskToListInput {
    task_description: String,
    list: String,
}

#[hdk_extern]
pub fn complete_task(task_action_hash: ActionHash) -> ExternResult<ActionHash> {
    let task = get_latest_task(task_action_hash.clone())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("task doesn't exist for action hash"))
    ))?;

    let updated_task = Task {
        description: task.description,
        status: TaskStatus::Complete,
    };
    update_entry(task_action_hash, updated_task)
}

#[hdk_extern]
pub fn get_lists(_: ()) -> ExternResult<Vec<String>> {
    let children_paths: Vec<TypedPath> = Path::from("all_lists")
        .typed(LinkTypes::ListNamePath)?
        .children_paths()?;
    let mut lists: Vec<String> = vec![];
    for path in children_paths {
        let leaf = path.leaf();
        if let Some(component) = leaf {
            let list: String = component
                .try_into()
                .map_err(|err| wasm_error!(WasmErrorInner::from(err)))?;
            lists.push(list.clone())
        }
    }
    Ok(lists)
}

#[hdk_extern]
pub fn get_tasks_in_list(list: String) -> ExternResult<Vec<(ActionHash, Task)>> {
    let mut tasks = Vec::<(ActionHash, Task)>::new();
    let links = get_links(
        list_typed_path(list)?.path_entry_hash()?,
        LinkTypes::ListToTask,
        None,
    )?;
    for list in links {
        let task = get_latest_task(list.target.clone().into())?.ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Malformed task"
        ))))?;
        tasks.push((list.target.into(),task))
    }
    Ok(tasks)
}

fn list_typed_path(list: String) -> ExternResult<TypedPath> {
    Path::from(format!("all_lists.{}", list)).typed(LinkTypes::ListNamePath)
}

pub fn entry_from_record<T: TryFrom<SerializedBytes, Error = SerializedBytesError>>(record: Record) -> ExternResult<T> {
    Ok(record
        .entry()
        .to_app_option()
        .map_err(|err| wasm_error!(WasmErrorInner::from(err)))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Malformed task"
        ))))?)
}

#[hdk_extern]
pub fn get_all_tasks(_:()) -> ExternResult<BTreeMap<String, Vec<(ActionHash, Task)>>> {
    let mut all_tasks: BTreeMap<String,Vec<(ActionHash,Task)>> = BTreeMap::new();
    let lists = get_lists(())?;
    for list in lists {
        all_tasks.insert(list.clone(), get_tasks_in_list(list)?);
    }
    Ok(all_tasks)
}