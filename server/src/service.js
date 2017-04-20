import serveFeed from "./serveFeed";
import source from "../../store/source.json";

const fetchUpdate = () => {
  Object.keys(source).map(item => {
    try {
      serveFeed(item, true);
    } catch (e) {
      console.log(e);
    }
  });
};

function AutoUpdateService() {
  var self = this;
  var startTime = 0;
  var minCount = 0;
  self.remaining = 5;
  var startMin = new Date(Date.now()).getMinutes();
  setInterval(() => {
    // if its one min
    if (startTime === 1) {
      // start timer again
      startTime = 0;
      // if its five min then
      if (minCount === 4) {
        //fetchUpdate();
        minCount = 0;
        self.remaining = 5;
        // if less then five min
      } else {
        console.log("one min passed => %s", startMin++);
        minCount++;
        self.remaining--;
      }
    }
    // after one min increase start time
    startTime++;
  }, 60000);
  return self.remaining;
}
export default AutoUpdateService;
