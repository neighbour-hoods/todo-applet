import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { TaskUpdateView } from './dist/task-update-view';
import { WrappedEntry, Task } from './dist/types';
import { TaskResourceView } from 'task-resource-view';

customElements.define('task-update-view', TaskUpdateView)

interface TaskUpdateViewProps {
  
}

const meta: Meta<TaskUpdateViewProps> = {
  title: 'TodoApplet/Task/UpdateView',
  component: 'task-update-view',
  argTypes: {
  },
  parameters: { 
    backgrounds: { default: 'surface' },
  },
  render: (args) => html`<task-update-view
  
  ></task-update-view>`,
};

export default meta;

type Story = StoryObj<TaskUpdateViewProps>;

// export const Default: Story = {
//   args: {

//   },
// };