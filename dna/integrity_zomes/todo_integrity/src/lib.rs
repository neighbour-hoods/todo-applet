use hdi::prelude::*;

#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Task(Task),
}
#[hdk_entry_helper]
#[derive(Clone)]
pub struct Task {
    pub description: String,
    pub status: TaskStatus,
    pub list: String,
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
    AllAgentsPath,
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
