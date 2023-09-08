import { Plugin } from "obsidian";

const requiredFields = [
  "id",
  "text",
  "time"
];

// Time constants, in ms
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default class CountdownPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("countdown", (source, el, ctx) => {
      // Holder for k:v pairs made in the codeblock
      const blockData: {[key: string]: string} = {};

      // extract from text into blockData
      const rows = source.split("\n").filter((row) => row.length > 0);
      rows.forEach((row) => {
        const [key, ...valParts] = row.split(":");
        blockData[key.trim()] = valParts.join(":").trim();
      });

      // TODO(eve): validate that all `requiredFields` are present in dict keys
      console.log(requiredFields)

      // Create HTML elements
      const countdownDiv = el.createEl("div");
      countdownDiv.setAttr("id", `countdown-${blockData["id"]}`);
      countdownDiv.setAttr("class", `countdown bg-${blockData["color"] || "black"}`)

      const countdownTitle = countdownDiv.createEl("h3");
      countdownTitle.setText(blockData["text"]);
      
      const countdownTimeLeft = countdownDiv.createEl("i");
      countdownTimeLeft.setText(blockData["time"]);
      
      const countdownTarget = new Date(blockData["time"]).getTime();

      // loop update the display
      setInterval(function() {
        const now = new Date().getTime();
        let timeDelta = countdownTarget - now;

        if(timeDelta == 0) {
          countdownTimeLeft.setText("Now!!!");
          return
        }

        const passedTarget = timeDelta < 0;
        if(passedTarget) {
          timeDelta = now - countdownTarget;
        }        

        // Time calculations for days, hours, minutes and seconds
        // TODO(eve): cleaner way here?
        const days = Math.floor(timeDelta / DAY);
        const hours = Math.floor((timeDelta % DAY) / (HOUR));
        const minutes = Math.floor((timeDelta % (HOUR)) / (MINUTE));
        const seconds = Math.floor((timeDelta % (MINUTE)) / SECOND);

        // TODO(eve): granularity settings
        const timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const timeRemainingSuffix = passedTarget ? "ago" : "";
        
        countdownTimeLeft.setText(`${timeRemaining}  ${timeRemainingSuffix}`);
      }, 1000);
    });
  }
}