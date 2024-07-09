import { AppletConfigInput, ConfigCulturalContext, ConfigDimension, ConfigMethod, ConfigResourceDef, ConfigThreshold, Dimension, Range } from '@neighbourhoods/client'
export const INSTALLED_APP_ID = 'todo-sensemaker';

// ==========RANGES==========
const importanceRange: Range = {
    "name": "another-1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const perceivedHeatRange: Range = {
    "name": "another-perceived_heat_range",
    "kind": {
        "Integer": { "min": 0, "max": 4 }
    }
}
const totalImportanceRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Float": { "min": 0, "max": 1000000 }
    }
}

// ==========DIMENSIONS==========
const importanceDimension: ConfigDimension = {
    "name": "Vote",
    "range": importanceRange,
    "computed": false
}

const perceivedHeatDimension: ConfigDimension = {
    "name": "Priority",
    "range": perceivedHeatRange,
    "computed": false
}
const totalImportanceDimension = {
    "name": "Votes",
    "range": totalImportanceRange,
    "computed": true
}
const averageHeatDimension = {
    "name": "Priority level",
    "range": perceivedHeatRange,
    "computed": true
}

// ==========RESOURCE DEFS==========
//@ts-ignore
const taskItemResourceDef: ConfigResourceDef = {
    "resource_name": "task_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "role_name": "todo_lists",
    "zome_name": "todo"
}

// ==========METHODS==========
const totalImportanceMethod: ConfigMethod = {
    "name": "Votes_method",
    "input_dimensions": [importanceDimension],
    "output_dimension": totalImportanceDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "requires_validation": false
}
const totalHeatMethod: ConfigMethod = {
    "name": "Priority_level_method",
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
//@ts-ignore
const appletConfig: AppletConfigInput = {
    "name": INSTALLED_APP_ID,
    "resource_defs": [taskItemResourceDef],
    "ranges": [importanceRange, totalImportanceRange, perceivedHeatRange],
    "dimensions": [importanceDimension, totalImportanceDimension, perceivedHeatDimension, averageHeatDimension],
    "methods": [totalImportanceMethod, totalHeatMethod],
    "cultural_contexts": [mostImportantTasksContext, hottestTasksContext]
}

export  { appletConfig }
