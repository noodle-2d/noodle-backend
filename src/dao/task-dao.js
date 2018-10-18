const dbUtils = require('../util/db/utils');

async function getTaskByIdAndAccountId (client, taskId, accountId) {
    const query = 'select t.* from task t inner join list l on l.id = t.list_id ' +
        'where t.id = $1 and l.account_id = $2';
    const results = await client.query(query, [taskId, accountId], dbUtils.mapFieldsToCamel);
    return dbUtils.getOnly(results);
}

async function getListRootTasks (client, listId) {
    return client.query('select * from task where list_id = $1 and parent_task_id is null order by index',
        [listId], dbUtils.mapFieldsToCamel);
}

async function getTaskSubtasks (client, parentTaskId) {
    return client.query('select * from task where parent_task_id = $1 order by index',
        [parentTaskId], dbUtils.mapFieldsToCamel);
}

async function insertTask (client, task) {
    return client.insert(task, 'task');
}

async function updateTask (client, id, title, description, status) {
    const params = [];
    const querySetParts = [];

    if (title) {
        params.push(title);
        querySetParts.push(`title = $${params.length}`);
    }

    if (description) {
        params.push(description);
        querySetParts.push(`description = $${params.length}`);
    }

    if (status) {
        params.push(status);
        querySetParts.push(`status = $${params.length}`);
    }

    params.push(id);
    const query = `update task set ${querySetParts.join(', ')} where id = $${params.length}`;
    await client.query(query, params);
}

module.exports = {
    getTaskByIdAndAccountId: getTaskByIdAndAccountId,
    getListRootTasks: getListRootTasks,
    getTaskSubtasks: getTaskSubtasks,
    insertTask: insertTask,
    updateTask: updateTask
};
