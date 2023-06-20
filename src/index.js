import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { multiaddr } from "multiaddr";
import { pingService } from "libp2p/ping";

const node = await createLibp2p({
  addresses: {
    listen: ["/ip4/127.0.0.1/tcp/0"],
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [mplex()],
  services: {
    ping: pingService({
      protocolPrefix: "ipfs",
    }),
  },
});

await node.start();
console.log("libp2p has started");

//print out listening address
console.log("listening on addresses:");
node.getMultiaddrs().forEach((address) => {
  console.log(address.toString());
});

if (process.argv.length >= 3) {
  const ma = multiaddr(process.argv[2]);
  console.log(`Pinging remote peer at ${process.argv[2]}`);
  const latency = await node.services.ping.ping(ma);
  console.log(`pinged ${process.argv[2]} in latency ${latency}ms`);
} else {
  console.log("no remote peer address given, skipping ping");
}

const stop = async () => {
  //stop libp2p
  await node.stop();
  console.log("libp2p has stopped");
  process.exit(0);
};

process.on("SIGTERM", stop);
process.on("SIGINT", stop);
