// Main Forge Protocol SDK class

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { ForgeConfig, ProtocolStats, WalletAdapter } from './types';
import { CoreClient } from './core';
import { CruciblesClient } from './crucibles';
import { SparksClient } from './sparks';
import { SmeltersClient } from './smelters';
import { HeatClient } from './heat';
import { ReactorsClient } from './reactors';
import { FirewallClient } from './firewall';
import { EngineersClient } from './engineers';

export class ForgeSDK {
  readonly connection: Connection;
  readonly wallet: WalletAdapter;
  readonly config: ForgeConfig;

  readonly core: CoreClient;
  readonly crucibles: CruciblesClient;
  readonly sparks: SparksClient;
  readonly smelters: SmeltersClient;
  readonly heat: HeatClient;
  readonly reactors: ReactorsClient;
  readonly firewall: FirewallClient;
  readonly engineers: EngineersClient;

  constructor(connection: Connection, wallet: WalletAdapter, config: ForgeConfig) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = config;

    this.core = new CoreClient(connection, wallet, config.coreProgramId);
    this.crucibles = new CruciblesClient(connection, wallet, config.cruciblesProgramId);
    this.sparks = new SparksClient(connection, wallet, config.sparksProgramId);
    this.smelters = new SmeltersClient(connection, wallet, config.smeltersProgramId);
    this.heat = new HeatClient(connection, wallet, config.heatProgramId);
    this.reactors = new ReactorsClient(connection, wallet, config.reactorsProgramId);
    this.firewall = new FirewallClient(connection, wallet, config.firewallProgramId);
    this.engineers = new EngineersClient(connection, wallet, config.engineersProgramId);
  }

  async getProtocolStats(): Promise<ProtocolStats> {
    // This would fetch data from the core program
    // For now, return mock data
    return {
      totalCrucibles: 10,
      totalTVL: 1_000_000,
      totalUsers: 500,
      averageAPR: 0.08,
    };
  }

  async isProtocolActive(): Promise<boolean> {
    // This would fetch data from the core program or firewall
    return true;
  }
}
