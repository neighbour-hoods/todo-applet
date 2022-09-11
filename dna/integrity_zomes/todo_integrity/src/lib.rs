use hdi::prelude::*;

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    #[entry_def()]
    Task(Task),
}
#[hdk_entry_helper]
#[derive(Clone)]
pub struct Task {
    pub description: String,
    pub status: TaskStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
pub enum TaskStatus {
  Complete,
  Incomplete,
}

#[hdk_link_types]
pub enum LinkTypes {
    ListToTask,
    ListNamePath,
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
