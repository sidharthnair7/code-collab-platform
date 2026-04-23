package projectCP.codeexecution;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.util.JSONPObject;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class CodeExecutionService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CodeExecutionResponse executeCode(CodeExecutionRequest request) throws JsonProcessingException {

        RestTemplate restTemplate = new RestTemplate();


        Map<String, Object> code = new HashMap<>();
        code.put("content", request.getCode());

        Map<String, Object> body = new HashMap<>();
        body.put("language", request.getLanguage());
        body.put("version", request.getVersion());
        body.put("files", List.of(code));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String raw = restTemplate.postForObject("https://emkc.org/api/v2/piston/execute",
                requestEntity, String.class);

        JsonNode root = objectMapper.readTree(raw);
        JsonNode run = root.path("run");

        return CodeExecutionResponse.builder()
                .output(run.path("stdout").asText())
                .runtimeError(run.path("stderr").asText())
                .exitCode(run.path("code").asInt())
                .success(run.path("code").asInt() == 0)
                .build();

    }



}
