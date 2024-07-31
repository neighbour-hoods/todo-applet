import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { TaskListView } from './dist/task-list-view';
import { WrappedEntry, Task } from './dist/types';
import { TaskResourceView } from 'task-resource-view';

customElements.define('task-list-view', TaskListView)

interface TaskListViewProps {
  listName: string;
  taskResourceView: typeof TaskResourceView;
  listTasks: Task[]
}

const meta: Meta<TaskListViewProps> = {
  title: 'TodoApplet/Task/ListView',
  component: 'task-list-view',
  argTypes: {
  },
  parameters: { 
    backgrounds: { default: 'surface' },
  },
  render: (args) => html`<task-list-view
    .listName=${args.listName}
    .listTasks=${args.listTasks}
    .taskResourceView=${args.taskResourceView}
  ></task-list-view>`,
};

export default meta;

type Story = StoryObj<TaskListViewProps>;

export const Default: Story = {
  args: {
    listName: "List 1",
    taskResourceView: TaskResourceView,
    listTasks: [
      {
        description: "Do a thing",
          status: {
            Complete: null,
        },
        list: "List 1"
      },
      {
        description: "Do another thing",
          status: {
            Complete: null,
        },
        list: "List 1"
      }
    ]
  },
};