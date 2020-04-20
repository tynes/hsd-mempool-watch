const {NodeClient} = require('hs-client');
const Config = require('bcfg');
const {BloomFilter} = require('bfilter');
const {TX} = require('hsd');

const ports = {
  main: 12037,
  testnet: 13037,
  regtest: 14037,
  simnet: 15037
};

(async () => {
  const config = new Config('hsd', {
    suffix: 'network',
    fallback: 'main',
    alias: {
      'n': 'network',
      'u': 'url',
      'uri': 'url',
      'k': 'api-key',
      's': 'ssl',
      'h': 'httphost',
      'p': 'httpport'
    }
  });

  config.load({
    argv: true,
    env: true
  });

  const network = config.str('network', 'main');

  const nclient = new NodeClient({
    url: config.str('url'),
    apiKey: config.str('api-key'),
    ssl: config.bool('ssl'),
    host: config.str('http-host'),
    port: config.uint('http-port')
      || ports[network]
      || ports.main,
    timeout: config.uint('timeout')
  });

  // To watch the mempool, a bloom filter must be sent to the node
  // and the node will return all transactions that match the
  // bloom filter. Since we want to view all transactions, we
  // fill the bloom filter with all 1 bits such that every tx
  // will match it. Send the filter to the node first with 'set filter'
  // and then call 'watch mempool' and set up an event listener
  // with bind('tx')

  const filter = BloomFilter.fromRate(1, 1, BloomFilter.flags.NONE);
  filter.filter.fill(0xff);  // hack so that everything matches the filter

  await nclient.open();
  await nclient.call('set filter', filter.encode());

  await nclient.call('watch mempool');

  nclient.bind('tx', async (raw) => {
    const tx = TX.decode(raw);
    console.log(tx)
  });

})().catch(async (err) => {
  console.log(err);
  process.exit(1);
});

