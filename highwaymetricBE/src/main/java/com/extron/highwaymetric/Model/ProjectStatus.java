package com.extron.highwaymetric.Model;

import com.fasterxml.jackson.annotation.JsonAlias;

public enum ProjectStatus {
    @JsonAlias("Under Implementation")
    UNDER_IMPLEMENTATION,

    @JsonAlias("Awarded But Not Started")
    AWARDED_BUT_NOT_STARTED,

    @JsonAlias("Balance For Award")
    BALANCE_FOR_AWARD,

    @JsonAlias("Completed")
    COMPLETED
}
