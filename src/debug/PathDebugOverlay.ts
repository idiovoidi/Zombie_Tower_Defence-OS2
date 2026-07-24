import { type Application, Container, Graphics, Text } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import type { MapData } from '../managers/MapManager';
import { ensurePathGraph } from '../path/pathGraph';

/**
 * Draws path graph nodes/edges when SHOW_WAYPOINTS is enabled.
 * Useful while tuning maps and PathRenderer without digging through code.
 */
export class PathDebugOverlay {
  private readonly root: Container;
  private readonly graphics: Graphics;
  private readonly labelLayer: Container;
  private labelNodes: Text[] = [];

  constructor(app: Application) {
    this.root = new Container();
    this.graphics = new Graphics();
    this.labelLayer = new Container();
    this.root.addChild(this.graphics);
    this.root.addChild(this.labelLayer);
    this.root.eventMode = 'none';
    app.stage.addChild(this.root);
  }

  public refresh(mapData: MapData | null | undefined): void {
    this.clearLabels();
    this.graphics.clear();

    if (!DebugConstants.ENABLED || !DebugConstants.SHOW_WAYPOINTS || !mapData) {
      this.root.visible = false;
      return;
    }

    this.root.visible = true;
    const graph = ensurePathGraph(mapData);
    const byId = new Map(graph.nodes.map(n => [n.id, n]));

    for (const edge of graph.edges) {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) {
        continue;
      }
      this.graphics.moveTo(from.x, from.y);
      this.graphics.lineTo(to.x, to.y);
      this.graphics.stroke({ width: 2, color: 0x00ffff, alpha: 0.7 });
    }

    for (const node of graph.nodes) {
      const isSpawn = node.id === graph.spawnId;
      const isEnd = node.id === graph.endId;
      const color = isSpawn ? 0x00ff66 : isEnd ? 0xff4444 : 0xffff00;
      const radius = isSpawn || isEnd ? 8 : 5;

      this.graphics.circle(node.x, node.y, radius).fill({ color, alpha: 0.85 });
      this.graphics.circle(node.x, node.y, radius).stroke({ width: 1, color: 0xffffff, alpha: 0.9 });

      const label = new Text({
        text: node.id,
        style: {
          fontFamily: 'monospace',
          fontSize: 10,
          fill: 0xffffff,
          stroke: { color: 0x000000, width: 2 },
        },
      });
      label.position.set(node.x + 10, node.y - 6);
      this.labelLayer.addChild(label);
      this.labelNodes.push(label);
    }
  }

  public clear(): void {
    this.clearLabels();
    this.graphics.clear();
    this.root.visible = false;
  }

  public destroy(): void {
    this.clear();
    this.root.destroy({ children: true });
  }

  private clearLabels(): void {
    for (const label of this.labelNodes) {
      label.destroy();
    }
    this.labelNodes = [];
    this.labelLayer.removeChildren();
  }
}
