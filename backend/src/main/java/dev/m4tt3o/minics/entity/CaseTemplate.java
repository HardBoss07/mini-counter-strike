package dev.m4tt3o.minics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cases")
@Getter
@Setter
public class CaseTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "caseTemplate", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<WeaponTemplate> weapons;
}
