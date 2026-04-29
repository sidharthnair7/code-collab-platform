package projectCP.codeexecution.Usage;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UsageTracker {


    private final Map<String, UsageInfo> usageByUser = new ConcurrentHashMap<>();

    public synchronized void checkUsageLimit(String username) {
        LocalDate today = LocalDate.now();
        long now = System.currentTimeMillis();
        UsageInfo usageInfo = usageByUser.get(username);
        if(usageInfo==null || !usageInfo.date.equals(today)) {
                usageInfo= new UsageInfo(today,0,0);
               usageByUser.put(username, usageInfo);
        }

        if(now- usageInfo.lastRunTimeMs<5000){
            throw new RuntimeException("Please wait 5 seconds before trying again");
        }
        if(usageInfo.runsToday>=20){
            throw new RuntimeException("Daily run limit reached");
        }
        usageInfo.runsToday++;
        usageInfo.lastRunTimeMs = now;


    }
}
