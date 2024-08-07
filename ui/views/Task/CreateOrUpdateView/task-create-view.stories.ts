import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { TaskCreateView } from './dist/task-create-view';
import { WrappedEntry, Task } from './dist/types';
import { TaskResourceView } from 'task-resource-view';

customElements.define('task-create-view', TaskCreateView)

interface TaskCreateViewProps {
  itemType: string
}

const meta: Meta<TaskCreateViewProps> = {
  title: 'TodoApplet/Task/CreateView',
  component: 'task-create-view',
  argTypes: {
  },
  parameters: { 
    backgrounds: { default: 'surface' },
  },
  render: (args) => html`<task-create-view
    .itemType=${args.itemType}
  ></task-create-view>`,
};

export default meta;

type Story = StoryObj<TaskCreateViewProps>;

export const Default: Story = {
  args: {
    itemType: "task"
  },
};

// export const List: Story = {
//   args: {
//     itemType: "list"
//   },
// };