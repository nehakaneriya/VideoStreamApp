package com.neha.VideoStreamApp.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID id;

    @Column(name = "user_email",unique = true,length = 300)
    private String email;

    private String name;

    @JsonIgnore
    private String password;
    private boolean enable=true;

    private Instant createdAt =Instant.now();
    private Instant updatedAt =Instant.now();

    @Enumerated(EnumType.STRING)
    private Provider provider=Provider.LOCAL;

    private String providerId;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable (
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles=new HashSet<>();

    @PrePersist
    protected void onCreate() {
        Instant now=Instant.now();

        if (createdAt==null) createdAt=now;
        updatedAt=now;
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt=Instant.now();
    }

    //UserDetails All Method
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        List<SimpleGrantedAuthority> authorities =
                roles
                        .stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .toList();
        return authorities;
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference // Ye batata hai ki ye Parent side hai
    private List<Video> videos = new ArrayList<>();
    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enable;
    }
}
