# todo applet
This is a basic todo list application where you can create multiple lists and add tasks to each list. These tasks can be toggled between completed and incomplete. Additionally, using the [neighbourhoods sensemaker]() along with the [neighbourhoods fork of We](https://github.com/neighbour-hoods/nh-we/pull/3) (which instantiates a sensemaker instance with each group) tasks can be "assessed" as "important" (currently just another checkbox). The app can then display a "social context", where todo items are ordered according to importance (total number of assessments) and which have at least one assessment.

## Environment Setup

1. Install the holochain dev environment (only nix-shell is required): https://developer.holochain.org/docs/install/
2. Enable Holochain cachix with:

```bash
nix-env -iA cachix -f https://cachix.org/api/v1/install
cachix use holochain-ci
```

3. Clone this repo and `cd` inside of it.
4. Enter the nix shell by running this in the root folder of the repository: 

```bash
nix-shell
npm install
```

This will install all the needed dependencies in your local environment, including `holochain`, `hc` and `npm`.

Run all the other instructions in this README from inside this nix-shell, otherwise **they won't work**.

## Bootstrapping a network

Create a whole network of nodes connected to each other and their respective UIs with.

```bash
npm run network 3
```

Substitute the "3" for the number of nodes that you want to bootstrap in your network.

This will also bring up the Holochain Playground for advanced introspection of the conductors.

## Running an agent
 
If you only want to run a single conductor and a UI connected to it:

```bash
npm start
```

To run another agent, open another terminal, and execute again:

```bash
npm start
```

Each new agent that you create this way will get assigned its own port and get connected to the other agents.

## Running the DNA tests

```bash
npm run test
```

## Building the DNA

```bash
npm run build:happ
```

## Package

To package the web happ:

``` bash
npm run package
```

You'll have the `todo.webhapp` in `workdir`. This is what you should distribute so that the Holochain Launcher can install it.

You will also have its subcomponent `todo.happ` in the same folder`.

## Documentation

This repository is using this tooling:

- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/): npm v7's built-in monorepo capabilities.
- [hc](https://github.com/holochain/holochain/tree/develop/crates/hc): Holochain CLI to easily manage Holochain development instances.
- [@holochain/tryorama](https://www.npmjs.com/package/@holochain/tryorama): test framework.
- [@holochain/client](https://www.npmjs.com/package/@holochain/client): client library to connect to Holochain from the UI.
- [@holochain-playground/cli](https://www.npmjs.com/package/@holochain-playground/cli): introspection tooling to understand what's going on in the Holochain nodes.

# Attribution
## applet logo
<a href="https://www.flaticon.com/free-icons/tick" title="tick icons">Tick icons created by Roundicons - Flaticon</a>