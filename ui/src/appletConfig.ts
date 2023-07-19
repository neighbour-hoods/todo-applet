import { AppletConfigInput, ConfigCulturalContext, ConfigDimension, ConfigMethod, ConfigResourceDef, ConfigThreshold, CreateAppletConfigInput, Dimension, Range } from '@neighbourhoods/client'

// ==========RANGES==========
const importanceRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const perceivedHeatRange: Range = {
    "name": "perceived_heat_range",
    "kind": {
        "Integer": { "min": 0, "max": 4 }
    }
}
const totalImportanceRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Integer": { "min": 0, "max": 1000000 }
    }
}

// ==========DIMENSIONS==========
const importanceDimension: ConfigDimension = {
    "name": "importance",
    "range": importanceRange,
    "computed": false
}

const perceivedHeatDimension: ConfigDimension = {
    "name": "perceived_heat",
    "range": perceivedHeatRange,
    "computed": false
}
const totalImportanceDimension = {
    "name": "total_importance",
    "range": totalImportanceRange,
    "computed": true
}
const averageHeatDimension = {
    "name": "average_heat",
    "range": perceivedHeatRange,
    "computed": true
}

// ==========RESOURCE DEFS==========
const taskItemResourceDef: ConfigResourceDef = {
    "name": "task_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "dimensions": [importanceDimension, totalImportanceDimension, perceivedHeatDimension, averageHeatDimension]
}

// ==========METHODS==========
const totalImportanceMethod: ConfigMethod = {
    "name": "total_importance_method",
    "target_resource_def": taskItemResourceDef,
    "input_dimensions": [importanceDimension],
    "output_dimension": totalImportanceDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "requires_validation": false
}
const totalHeatMethod: ConfigMethod = {
    "name": "average_heat_method",
    "target_resource_def": taskItemResourceDef,
    "input_dimensions": [perceivedHeatDimension],
    "output_dimension": averageHeatDimension,
    "program": { "Average": null },
    "can_compute_live": false,
    "requires_validation": false
}

// ==========THRESHOLDS==========
const importanceThreshold: ConfigThreshold = {
    "dimension": totalImportanceDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 0 }
}
const heatThreshold: ConfigThreshold = {
    "dimension": averageHeatDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 2 }
}

// ==========CULTURAL CONTEXTS==========
const mostImportantTasksContext: ConfigCulturalContext = {
    "name": "important",
    "resource_def": taskItemResourceDef,
    "thresholds": [importanceThreshold],
    "order_by": [[totalImportanceDimension, { "Biggest": null }]]
}
const hottestTasksContext: ConfigCulturalContext = {
    "name": "urgent",
    "resource_def": taskItemResourceDef,
    "thresholds": [heatThreshold],
    "order_by": [[averageHeatDimension, { "Biggest": null }]]
}

// ==========APPLET CONFIG==========
const appletConfigInput: AppletConfigInput = {
    "name": "todo_applet",
    "ranges": [importanceRange, totalImportanceRange, perceivedHeatRange],
    "dimensions": [importanceDimension, totalImportanceDimension, perceivedHeatDimension, averageHeatDimension],
    "resource_defs": [taskItemResourceDef],
    "methods": [totalImportanceMethod, totalHeatMethod],
    "cultural_contexts": [mostImportantTasksContext, hottestTasksContext]
}

const appletConfig: CreateAppletConfigInput = {
    "applet_config_input": appletConfigInput,
    "role_name": "todo_lists"
} 

export  { appletConfig }