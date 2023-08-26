import { Injectable } from '@nestjs/common';

import cluster from 'cluster';
import * as process from 'node:process';
import * as os from 'os';

@Injectable()
export class ClusterService {
  static register(workers: number, callback: any): void {
    const numCPUs = os.cpus().length;

    if (cluster?.isPrimary) {
      console.log(`Master server started on ${process.pid}`);

      process.on('SIGINT', () => {
        console.log('Cluster shutting down...');
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }

        process.exit(0);
      });

      if (workers > numCPUs) workers = numCPUs;

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('online', (worker) => {
        console.log('Worker %s is online', worker.process.pid);
      });

      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);

        cluster.fork();
      });
    } else {
      callback();
    }
  }
}
