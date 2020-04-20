const {NodeClient, WalletClient} = require('hs-client');
const Config = require('bcfg');

const ports = {
  main: 12037,
  testnet: 13037,
  regtest: 14037,
  simnet: 15037
};

const wports = {
  main: 12039,
  testnet: 13039,
  regtest: 14039,
  simnet: 15039
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

  const wclient = new WalletClient({
    url: config.str('url'),
    apiKey: config.str('api-key'),
    ssl: config.bool('ssl'),
    host: config.str('http-host'),
    port: config.uint('http-port')
      || wports[network]
      || wports.main,
    timeout: config.uint('timeout')
  });

  const wallet = wclient.wallet('primary');

  const info = await wallet.getAccount('default');
  const {receiveAddress} = info;

  for (let i = 0; i < 5; i++)
    await nclient.execute('generatetoaddress', [2, receiveAddress]);

  while (true) {

    for (let i = 0; i < 10; i ++) {
      await wallet.send({
        outputs: [{value: 1e6, address: receiveAddress}]
      });
    }

    await sleep(200);

    await nclient.execute('generatetoaddress', [1, receiveAddress]);
  }
})().catch(async (err) => {
  console.log(err);
  process.exit(1);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
