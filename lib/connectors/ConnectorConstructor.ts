import AbstractConnector from "./AbstractConnector.ts";

interface ConnectorConstructor {
  new (options: unknown): AbstractConnector;
}

export default ConnectorConstructor;
