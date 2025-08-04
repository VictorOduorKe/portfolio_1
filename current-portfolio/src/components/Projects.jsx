import React, { useState, useEffect, useRef } from "react";
import { projects as importedProjects } from "../assets/skills";

const Projects = () => {
  const [projects, setProjects] = useState(
    importedProjects.map((p, i) => ({
      ...p,
      _id: `${i}-${p.project_name}`,
      isExiting: false,
    }))
  );

  const removeProject = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isExiting: true } : p))
    );
  };

  // after exit animation, actually remove
  useEffect(() => {
    const timers = [];
    projects.forEach((p) => {
      if (p.isExiting) {
        const t = window.setTimeout(() => {
          setProjects((prev) => prev.filter((x) => x._id !== p._id));
        }, 400); // should match exit transition duration
        timers.push(t);
      }
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [projects]);

  return (
    <section>
      <div className="projects-container" id="projects">
        <h1>Projects</h1>
        <div className="projects">
          {projects.map((project, index) => (
            <AnimatedCard
              key={project._id}
              project={project}
              index={index}
              onRemove={() => removeProject(project._id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const AnimatedCard = ({ project, index, onRemove }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const delay = index * 100;
    const entryTimer = window.setTimeout(() => {
      el.classList.add("enter");
    }, delay);
    return () => clearTimeout(entryTimer);
  }, [index]);

  useEffect(() => {
    if (project.isExiting && ref.current) {
      ref.current.classList.add("exit");
    }
  }, [project.isExiting]);

  return (
    <div ref={ref} className="project project-card">
      <h1>{project.project_name}</h1>
      <img
        src={project.project_image}
        alt={project.project_name}
        style={{
          width: "100%",
          borderRadius: 8,
          objectFit: "cover",
          marginBottom: 8,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <a
          href={project.status ? "#" : project.project_link}
          target={project.status ? "_self" : "_blank"}
          className={project.status ? "disabled-link" : ""}
          rel={project.status ? undefined : "noopener noreferrer"}
        >
          Visit Here
        </a>
        <button
          onClick={onRemove}
          aria-label="Remove project"
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Projects;
