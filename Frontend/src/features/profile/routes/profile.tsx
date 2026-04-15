import React from 'react';
import { User, Briefcase, Code, GraduationCap, HardHat, FileText, Globe, GitFork, BookOpen, Smile, Award, Sparkles } from 'lucide-react';

export default function Account() {
  const accountDetails = {
    name: "Amer Zueher",
    role: "AI Expert",
    email: "amerzuher@outlook.com",
    profilePicture: "PP.jpg",
    aboutMe: "AI and Software Engineering professional with extensive expertise in machine learning, deep learning, natural language processing, computer vision, big data, and full-stack development. Passionate about solving complex real-world problems by building scalable AI-driven solutions and data platforms. I have successfully led and contributed to multiple projects spanning AI model development, automation, web applications, cloud, and data engineering — continuously expanding my skill set to stay at the forefront of technology.",
    education: {
      degree: "Bachelor’s Degree in Computer Science (AI & Data Science)",
      university: "Tafila Technical University, Jordan",
      gpa: "3.05",
      graduation: "June 2024"
    },
    technicalSkills: [
      { category: 'AI & Machine Learning', skills: ['TensorFlow', 'Keras', 'PyTorch', 'SpaCy', 'Hugging Face Transformers', 'Apache Spark', 'Hadoop', 'Computer Vision'] },
      { category: 'Web & Backend Development', skills: ['React', 'Next.js', 'Material-UI', 'Node.js', 'Flask', 'FastAPI', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
      { category: 'Automation & DevOps', skills: ['Python', 'Bash', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'] },
    ],
    projectHighlights: [
      'Developed AI-powered solutions for image recognition, NLP tasks, and data analysis.',
      'Built full-stack web applications delivering rich user experiences and responsive design.',
      'Engineered data pipelines and utilized big data frameworks to process and analyze massive datasets.',
      'Automated workflows and tasks in Linux environments to improve operational efficiency.',
      'Integrated AI models into production systems with REST APIs and containerized deployments.',
    ],
    softSkills: [
      'Strong analytical and problem-solving abilities',
      'Effective communication and teamwork in cross-functional teams',
      'Self-driven with a continuous learning mindset',
      'Detail-oriented and quality-focused',
    ],
    professionalDevelopment: 'Consistently updated skills through advanced courses, workshops, and seminars in AI/ML and software engineering. Active participant in tech communities and collaborative projects. Exploring emerging AI technologies and practical applications.',
    githubStatsUrl: "https://github-readme-stats.vercel.app/api/top-langs/?username=AmerZuher&theme=dark&background=000000"
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI & Machine Learning':
        return <Sparkles size={16} />;
      case 'Web & Backend Development':
        return <Code size={16} />;
      case 'Automation & DevOps':
        return <GitFork size={16} />;
      default:
        return <Briefcase size={16} />;
    }
  };

  return (
    <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        {/* Header and Profile Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-10 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
          <div className="relative w-32 h-32 flex-shrink-0">
            <img
              src='PP.JPG'
              className="w-full h-full rounded-full object-cover border-4"
              style={{ borderColor: 'var(--border)' }}
              alt="Profile Picture"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://placehold.co/128x128/9CA3AF/ffffff?text=AZ'; }}
            />
            <div className="absolute bottom-0 right-0 p-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}>
              <User className="text-white" size={20} />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{accountDetails.name}</h1>
            <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{accountDetails.role}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>{accountDetails.email}</p>
            <p className="mt-4 text-base" style={{ color: 'var(--text-primary)' }}>
              {accountDetails.aboutMe}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Qualifications</h2>

            {/* Education Section */}
            <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
              <h3 className="text-xl font-semibold flex items-center gap-2"><GraduationCap size={20} /> Education</h3>
              <p className="mt-4 text-lg font-medium">{accountDetails.education.degree}</p>
              <p style={{ color: 'var(--text-primary)' }}>{accountDetails.education.university} | GPA: {accountDetails.education.gpa} | Graduation: {accountDetails.education.graduation}</p>
            </div>

            {/* Technical Skills Section */}
            <h3 className="text-xl font-semibold mb-4">Technical Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accountDetails.technicalSkills.map((skill, index) => (
                <div key={index} className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="font-semibold flex items-center gap-2">{getCategoryIcon(skill.category)} {skill.category}</h4>
                  <ul className="mt-2 text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                    {skill.skills.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Project Highlights */}
            <h3 className="text-xl font-semibold mt-8 mb-4">Project Highlights</h3>
            <ul className="space-y-4" style={{ color: 'var(--text-primary)' }}>
              {accountDetails.projectHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                  <p className="text-base">{highlight}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column */}
          <div>
            {/* Soft Skills */}
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Smile size={20} /> Soft Skills</h3>
            <ul className="space-y-3 mb-8" style={{ color: 'var(--text-primary)' }}>
              {accountDetails.softSkills.map((skill, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                  {skill}
                </li>
              ))}
            </ul>

            {/* Professional Development */}
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><BookOpen size={20} /> Professional Development</h3>
            <p className="text-base mb-8" style={{ color: 'var(--text-primary)' }}>{accountDetails.professionalDevelopment}</p>


            {/* Thank you note */}
            <p className="text-center mt-10 text-base" style={{ color: 'var(--text-primary)' }}>
              Thank you for visiting! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
