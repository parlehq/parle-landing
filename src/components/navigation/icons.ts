import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faBuildingShield,
  faChartLine,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

config.autoAddCss = false;

export const navIcons: Record<string, IconDefinition> = {
  code: faCode,
  shield: faBuildingShield,
  chart: faChartLine,
};
