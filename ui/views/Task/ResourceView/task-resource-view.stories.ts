import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { TaskResourceView } from './dist/task-resource-view';
import { WrappedEntry, Task } from './dist/types';

!customElements.get('task-resource-view') && customElements.define('task-resource-view', TaskResourceView)

interface TaskResourceViewProps {
  task: Task;
}

const meta: Meta<TaskResourceViewProps> = {
  title: 'TodoApplet/Task/ResourceView',
  component: 'task-resource-view',
  argTypes: {
  },
  parameters: { 
    backgrounds: { default: 'surface' },
  },
  render: (args) => html`<task-resource-view
    .task=${args.task}
  ></task-resource-view>`,
};

export default meta;

type Story = StoryObj<TaskResourceViewProps>;

export const Default: Story = {
  args: {
    task: {
      description: "Do a thing",
        status: {
          Complete: null,
      },
      list: "List 1"
    }
  },
};