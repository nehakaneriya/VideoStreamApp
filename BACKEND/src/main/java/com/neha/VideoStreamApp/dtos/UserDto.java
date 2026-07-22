package com.neha.VideoStreamApp.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.neha.VideoStreamApp.entities.Provider;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {

    private UUID id;
    private String email;
    private String name;

    // Sirf incoming request (register/update) mein password read hoga,
    // response JSON mein kabhi serialize nahi hoga — hash leak prevent karta hai
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private boolean enable=true;

    private Instant createdAt =Instant.now();
    private Instant updatedAt =Instant.now();

    private Provider provider=Provider.LOCAL;

    private Set<RoleDto> roles=new HashSet<>();




}
