package projectCP.codeexecution.Usage;

import lombok.AllArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
public class UsageInfo{
    LocalDate date;
    int runsToday;
    long lastRunTimeMs;
}
