import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";

actor {
  type Tower = {
    name : Text;
    region : Text;
    latitude : Float;
    longitude : Float;
  };

  type SignalPosition = {
    latitude : Float;
    longitude : Float;
    compassHeading : Float;
    rssiDbm : Nat;
    heightRecommendation : Nat;
    tiltAngle : Float;
    timestamp : Int;
  };

  let towerMap = Map.empty<Text, Tower>();
  let signalPositionMap = Map.empty<Text, SignalPosition>();
  let settingsMap = Map.empty<Text, Text>();

  public shared ({ caller }) func addTower(name : Text, region : Text, latitude : Float, longitude : Float) : async () {
    let tower : Tower = {
      name;
      region;
      latitude;
      longitude;
    };
    towerMap.add(name, tower);
  };

  public query ({ caller }) func getTowers() : async [Tower] {
    towerMap.values().toArray();
  };

  public query ({ caller }) func getTowerByName(name : Text) : async ?Tower {
    towerMap.get(name);
  };

  public shared ({ caller }) func saveSignalPosition(id : Text, latitude : Float, longitude : Float, compassHeading : Float, rssiDbm : Nat, heightRecommendation : Nat, tiltAngle : Float) : async () {
    let position : SignalPosition = {
      latitude;
      longitude;
      compassHeading;
      rssiDbm;
      heightRecommendation;
      tiltAngle;
      timestamp = Time.now();
    };
    signalPositionMap.add(id, position);
  };

  public query ({ caller }) func getSignalPositions() : async [SignalPosition] {
    signalPositionMap.values().toArray();
  };

  public shared ({ caller }) func clearSignalPositions() : async () {
    signalPositionMap.clear();
  };

  public shared ({ caller }) func setAppSetting(key : Text, value : Text) : async () {
    settingsMap.add(key, value);
  };

  public query ({ caller }) func getAppSetting(key : Text) : async ?Text {
    settingsMap.get(key);
  };

  public query ({ caller }) func getAllAppSettings() : async [(Text, Text)] {
    settingsMap.toArray();
  };
};
