# hsd-mempool-watch

Quick guide on how to watch the mempool.

## Installation

```bash
$ npm i
```

This app uses 3 terminals.

### Terminal 1

Start `hsd` in regtest

```bash
$ npx hsd --network regtest --memory true
```

### Terminal 2

Set up the mempool listener.

```bash
$ node watch.js --network regtest
```

### Terminal 3

Create a bunch of transactions and mine blocks.

```bash
$ node create-txs.js --network regtest
```
