import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Nat "mo:core/Nat";



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

  type SignalQuality = {
    #Excellent;
    #Good;
    #Weak;
    #None;
  };

  type CommunitySignalReport = {
    id : Nat;
    latitude : Float;
    longitude : Float;
    quality : SignalQuality;
    note : ?Text;
    timestamp : Int;
  };

  type CoverageGapReport = {
    id : Nat;
    latitude : Float;
    longitude : Float;
    description : Text;
    timestamp : Int;
  };

  type TowerStatusLog = {
    towerName : Text;
    reachable : Bool;
    latencyMs : Nat;
    timestamp : Int;
  };

  let towerMap = Map.empty<Text, Tower>();
  let signalPositionMap = Map.empty<Text, SignalPosition>();
  let settingsMap = Map.empty<Text, Text>();
  let communitySignalReports = Map.empty<Nat, CommunitySignalReport>();
  let coverageGapReports = Map.empty<Nat, CoverageGapReport>();
  let towerStatusLogs = Map.empty<Nat, TowerStatusLog>();

  var nextSignalReportId = 1;
  var nextCoverageGapId = 1;
  var nextStatusLogId = 1;

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

  // Community signal reports
  public shared ({ caller }) func addCommunitySignalReport(latitude : Float, longitude : Float, quality : SignalQuality, note : ?Text) : async Nat {
    let newId = nextSignalReportId;
    let report : CommunitySignalReport = {
      id = newId;
      latitude;
      longitude;
      quality;
      note;
      timestamp = Time.now();
    };
    communitySignalReports.add(newId, report);
    nextSignalReportId += 1;
    newId;
  };

  public query ({ caller }) func getCommunitySignalReports() : async [CommunitySignalReport] {
    communitySignalReports.values().toArray();
  };

  public shared ({ caller }) func clearCommunitySignalReports() : async () {
    communitySignalReports.clear();
    nextSignalReportId := 1;
  };

  // Coverage gap reports
  public shared ({ caller }) func addCoverageGapReport(latitude : Float, longitude : Float, description : Text) : async Nat {
    let newId = nextCoverageGapId;
    let report : CoverageGapReport = {
      id = newId;
      latitude;
      longitude;
      description;
      timestamp = Time.now();
    };
    coverageGapReports.add(newId, report);
    nextCoverageGapId += 1;
    newId;
  };

  public query ({ caller }) func getCoverageGapReports() : async [CoverageGapReport] {
    coverageGapReports.values().toArray();
  };

  // Tower status logs
  public shared ({ caller }) func addTowerStatusLog(towerName : Text, reachable : Bool, latencyMs : Nat) : async Nat {
    let newId = nextStatusLogId;
    let log : TowerStatusLog = {
      towerName;
      reachable;
      latencyMs;
      timestamp = Time.now();
    };
    towerStatusLogs.add(newId, log);
    nextStatusLogId += 1;
    newId;
  };

  public query ({ caller }) func getAllTowerStatusLogs() : async [TowerStatusLog] {
    towerStatusLogs.values().toArray();
  };

  public shared ({ caller }) func clearOldTowerStatusLogs(olderThanSeconds : Nat) : async () {
    let cutoffTime = Time.now() - (olderThanSeconds * 1_000_000_000);
    let filteredLogs = towerStatusLogs.filter(
      func(_id, log) { log.timestamp >= cutoffTime }
    );
    towerStatusLogs.clear();
    for ((k, v) in filteredLogs.entries()) {
      towerStatusLogs.add(k, v);
    };
  };
};
