-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "all_state_market_data_FINALSET" (
    "state_abbr" varchar(2)   NOT NULL,
    "date" varchar(6)   NOT NULL,
    "handle" float(10)   NOT NULL,
    "revenue" float(9)   NOT NULL,
    "hold" float(6)   NOT NULL,
    "taxes" float(8)   NOT NULL
);

CREATE TABLE "Legal_online_inperson_FinalSet" (
    "state" varchar(20)   NOT NULL,
    "online" varchar(7)   NOT NULL,
    "in_person" varchar(7)   NOT NULL,
    "Ways_to_bet" varchar(18)   NOT NULL
);

CREATE TABLE "market_rev_teams_df_FINALSET" (
    "state_abbr" varchar(2)   NOT NULL,
    "state" varchar(20)   NOT NULL,
    "handle" float(11)   NOT NULL,
    "revenue" float(10)   NOT NULL,
    "hold" float(18)   NOT NULL,
    "taxes" float(10)   NOT NULL,
    "Teams_Count" float(2)   NOT NULL,
    "MLB" float(1)   NOT NULL,
    "NBA" float(1)   NOT NULL,
    "NFL" float(1)   NOT NULL,
    "NHL" float(1)   NOT NULL,
    "MLS" float(1)   NOT NULL,
    "NCAA" float(1)   NOT NULL
);

CREATE TABLE "month_rev_each_state_df_FINALSET" (
    "month" varchar(14)   NOT NULL,
    "handle" float(2)   NOT NULL,
    "revenue" float(10)   NOT NULL,
    "hold" float(18)   NOT NULL,
    "taxes" float(9)   NOT NULL
);

CREATE TABLE "state_list_REFERENCE" (
    "state_abbr" varchar(2)   NOT NULL,
    "state" varchar(20)   NOT NULL,
    CONSTRAINT "pk_state_list_REFERENCE" PRIMARY KEY (
        "state"
     )
);

CREATE TABLE "Census_data_FINALSET" (
    "state" varchar(52)   NOT NULL,
    "population_total" float(8)   NOT NULL,
    "population_under_18" float(7)   NOT NULL,
    "earnings_median" float(5)   NOT NULL,
    "population_over_18" float(7)   NOT NULL
);

