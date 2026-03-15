import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

actor {
  type PageType = {
    #plain;
    #normal;
    #habit;
    #timetracker;
  };

  type DiaryEntry = {
    id : Nat;
    content : Text;
    pageType : PageType;
    timestamp : Time.Time;
  };

  type Habit = {
    name : Text;
    goal : Nat;
    frequency : Nat;
  };

  type HabitTracker = {
    habits : [Habit];
    completions : [Time.Time];
  };

  type Milestone = {
    title : Text;
    date : Time.Time;
    category : {
      #day;
      #week;
      #month;
      #year;
    };
  };

  type DiaryData = {
    entries : [DiaryEntry];
    habitTracker : HabitTracker;
    milestones : [Milestone];
  };

  module DiaryEntry {
    public func compare(a : DiaryEntry, b : DiaryEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Milestone {
    public func compare(a : Milestone, b : Milestone) : Order.Order {
      switch (Text.compare(a.title, b.title)) {
        case (#equal) { Int.compare(a.date, b.date) };
        case (order) { order };
      };
    };
  };

  stable var nextEntryId : Nat = 0;

  let diaryDataStorage = Map.empty<Principal, DiaryData>();

  public shared ({ caller }) func saveDiaryData(data : DiaryData) : async () {
    diaryDataStorage.add(caller, data);
  };

  public query ({ caller }) func loadDiaryData() : async ?DiaryData {
    diaryDataStorage.get(caller);
  };

  public shared ({ caller }) func addDiaryEntry(content : Text, pageType : PageType) : async () {
    let entryId = nextEntryId;
    nextEntryId += 1;
    let newEntry : DiaryEntry = {
      id = entryId;
      content;
      pageType;
      timestamp = Time.now();
    };

    let currentData = switch (diaryDataStorage.get(caller)) {
      case (null) {
        {
          entries = [newEntry];
          habitTracker = { habits = []; completions = [] };
          milestones = [];
        };
      };
      case (?data) {
        let updatedEntries = data.entries.concat([newEntry]);
        {
          entries = updatedEntries;
          habitTracker = data.habitTracker;
          milestones = data.milestones;
        };
      };
    };

    diaryDataStorage.add(caller, currentData);
  };

  public shared ({ caller }) func addHabit(habit : Habit) : async () {
    let currentData = switch (diaryDataStorage.get(caller)) {
      case (null) {
        {
          entries = [];
          habitTracker = { habits = [habit]; completions = [] };
          milestones = [];
        };
      };
      case (?data) {
        let updatedHabits = data.habitTracker.habits.concat([habit]);
        let updatedHabitTracker = {
          habits = updatedHabits;
          completions = data.habitTracker.completions;
        };
        {
          entries = data.entries;
          habitTracker = updatedHabitTracker;
          milestones = data.milestones;
        };
      };
    };

    diaryDataStorage.add(caller, currentData);
  };

  public shared ({ caller }) func completeHabit(habitIndex : Nat) : async () {
    let currentData = switch (diaryDataStorage.get(caller)) {
      case (null) { return () };
      case (?data) {
        let updatedCompletions = data.habitTracker.completions.concat([Time.now()]);
        let updatedHabitTracker = {
          habits = data.habitTracker.habits;
          completions = updatedCompletions;
        };
        {
          entries = data.entries;
          habitTracker = updatedHabitTracker;
          milestones = data.milestones;
        };
      };
    };

    diaryDataStorage.add(caller, currentData);
  };

  public shared ({ caller }) func addMilestone(title : Text, category : { #day; #week; #month; #year }) : async () {
    let newMilestone : Milestone = {
      title;
      date = Time.now();
      category;
    };

    let currentData = switch (diaryDataStorage.get(caller)) {
      case (null) {
        {
          entries = [];
          habitTracker = { habits = []; completions = [] };
          milestones = [newMilestone];
        };
      };
      case (?data) {
        let updatedMilestones = data.milestones.concat([newMilestone]);
        {
          entries = data.entries;
          habitTracker = data.habitTracker;
          milestones = updatedMilestones;
        };
      };
    };

    diaryDataStorage.add(caller, currentData);
  };

  public query ({ caller }) func getDiaryEntries() : async [DiaryEntry] {
    switch (diaryDataStorage.get(caller)) {
      case (null) { [] };
      case (?data) { data.entries.sort() };
    };
  };

  public query ({ caller }) func getHabits() : async [Habit] {
    switch (diaryDataStorage.get(caller)) {
      case (null) { [] };
      case (?data) { data.habitTracker.habits };
    };
  };

  public query ({ caller }) func getMilestones() : async [Milestone] {
    switch (diaryDataStorage.get(caller)) {
      case (null) { [] };
      case (?data) { data.milestones.sort() };
    };
  };
};
