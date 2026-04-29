package projectCP.codeexecution;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import projectCP.codeexecution.Usage.UsageTracker;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor

@Service
public class CodeExecutionService {
    @Value("${judge0.api.key}")
    private String judge0ApiKey;
    @Value("${judge0.api.host}")
    private String judge0ApiHost;
    @Value("${judge0.api.url}")
    private String judge0ApiUrl;

    private ObjectMapper objectMapper = new ObjectMapper();
    private final UsageTracker usageTracker;

    public CodeExecutionResponse executeCode(CodeExecutionRequest request, Authentication authentication) throws JsonProcessingException {

        String username = authentication.getName();
        usageTracker.checkUsageLimit(username);

        RestTemplate restTemplate = new RestTemplate();


        Map<String, Object> body = new HashMap<>();
        body.put("source_code", request.getCode());
        body.put("language_id", request.getLanguageId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-RapidAPI-Key", judge0ApiKey);
        headers.set("X-RapidAPI-Host", judge0ApiHost);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String raw = restTemplate.postForObject(judge0ApiUrl, requestEntity, String.class);

        JsonNode root = objectMapper.readTree(raw);
        String stdout = root.path("stdout").asText("");
        String stderr = root.path("stderr").asText("");
        String compileOutput = root.path("compile_output").asText("");
        int statusId = root.path("status").path("id").asInt();

        return CodeExecutionResponse.builder()
                .output(stdout)
                .runtimeError(stderr)
                .compileOutput(compileOutput)
                .exitCode(statusId)
                .success(statusId == 3)
                .build();

    }






}
