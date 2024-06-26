use hdk::prelude::*;
use todo_integrity::{LinkTypes, Task};

use crate::WrappedEntry;

const ALL_AGENTS_PATH: &str = "all_agents";

pub fn all_agents_typed_path() -> ExternResult<TypedPath> {
    Ok(Path::from(format!("{}", ALL_AGENTS_PATH)).typed(LinkTypes::AllAgentsPath)?)
}

#[hdk_extern]
pub fn get_all_agents(_: ()) -> ExternResult<Vec<AgentPubKey>> {
    let my_pub_key = agent_info()?.agent_initial_pubkey;
    let all_agents_path = all_agents_typed_path()?;
    let all_agents_links = get_links(
        all_agents_path.path_entry_hash()?, 
        LinkTypes::AllAgentsPath,
        None,
    )?;
    let all_agents: Vec<AgentPubKey> = all_agents_links
        .into_iter()
        .filter_map(|link| link.target.into_agent_pub_key())
        .collect();
    let all_other_agents = all_agents
        .iter()
        .filter(|agent| agent.clone() != &my_pub_key)
        .cloned()
        .collect();
    Ok(all_other_agents)
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum Signal {
    NewList {
        list: String,
    },
    NewTask {
        task: WrappedEntry<Task>,
    },
}

#[hdk_extern]
fn recv_remote_signal(signal: ExternIO) -> ExternResult<()> {
    let sig: Signal = signal
        .decode()
        .map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into())))?;
    Ok(emit_signal(&sig)?)
}