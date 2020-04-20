const {NodeClient} = require('hs-client');
const Config = require('bcfg');

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

  const info = await nclient.getInfo();

  await nclient.open();
  await nclient.call('watch mempool');

  nclient.hook('mempool tx', async (data) => {
    console.log(data);
  });

})().catch(async (err) => {
  console.log(err);
  process.exit(1);
});
