import { AppletConfigInput, ConfigCulturalContext, ConfigDimension, ConfigMethod, ConfigResourceDef, ConfigThreshold, CreateAppletConfigInput, Dimension, Range } from '@neighbourhoods/client'

const importanceRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const importanceDimension: ConfigDimension = {
    "name": "importance",
    "range": importanceRange,
    "computed": false
}

const totalImportanceRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Integer": { "min": 0, "max": 1000000 }
    }
}
const totalImportanceDimension = {
    "name": "total_importance",
    "range": totalImportanceRange,
    "computed": true
}

const taskItemResourceDef: ConfigResourceDef = {
    "name": "task_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "dimensions": [importanceDimension, totalImportanceDimension]
}

const totalImportanceMethod: ConfigMethod = {
    "name": "total_importance_method",
    "target_resource_def": taskItemResourceDef,
    "input_dimensions": [importanceDimension],
    "output_dimension": totalImportanceDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "requires_validation": false
}

const importanceThreshold: ConfigThreshold = {
    "dimension": totalImportanceDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 0 }
}
const mostImportantTasksContext: ConfigCulturalContext = {
    "name": "most_important_tasks",
    "resource_def": taskItemResourceDef,
    "thresholds": [importanceThreshold],
    "order_by": [[totalImportanceDimension, { "Biggest": null }]]
}
const appletConfig: AppletConfigInput = {
    "name": "todo_applet",
    "ranges": [importanceRange, totalImportanceRange],
    "dimensions": [importanceDimension, totalImportanceDimension],
    "resource_defs": [taskItemResourceDef],
    "methods": [totalImportanceMethod],
    "cultural_contexts": [mostImportantTasksContext]
}

const createAppletConfigInput: CreateAppletConfigInput = {
    "applet_config_input": appletConfig,
    "role_name": "todo_lists"
} 

export default createAppletConfigInput