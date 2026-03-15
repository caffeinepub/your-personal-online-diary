import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DiaryData {
    entries: Array<DiaryEntry>;
    habitTracker: HabitTracker;
    milestones: Array<Milestone>;
}
export type Time = bigint;
export interface DiaryEntry {
    id: bigint;
    content: string;
    pageType: PageType;
    timestamp: Time;
}
export interface Habit {
    goal: bigint;
    name: string;
    frequency: bigint;
}
export interface HabitTracker {
    completions: Array<Time>;
    habits: Array<Habit>;
}
export interface Milestone {
    title: string;
    date: Time;
    category: Variant_day_month_week_year;
}
export enum PageType {
    habit = "habit",
    timetracker = "timetracker",
    normal = "normal",
    plain = "plain"
}
export enum Variant_day_month_week_year {
    day = "day",
    month = "month",
    week = "week",
    year = "year"
}
export interface backendInterface {
    addDiaryEntry(content: string, pageType: PageType): Promise<void>;
    addHabit(habit: Habit): Promise<void>;
    addMilestone(title: string, category: Variant_day_month_week_year): Promise<void>;
    completeHabit(habitIndex: bigint): Promise<void>;
    getDiaryEntries(): Promise<Array<DiaryEntry>>;
    getHabits(): Promise<Array<Habit>>;
    getMilestones(): Promise<Array<Milestone>>;
    loadDiaryData(): Promise<DiaryData | null>;
    saveDiaryData(data: DiaryData): Promise<void>;
}
