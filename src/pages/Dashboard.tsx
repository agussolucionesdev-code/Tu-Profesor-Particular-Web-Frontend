import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Boxes,
  Brain,
  Compass,
  FileText,
  Image,
  Layers,
  LibraryBig,
  LoaderCircle,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Wand2,
} from "lucide-react";
import { authService } from "../services/auth.service";
import {
  subjectApiService,
  type SubjectResponse,
} from "../services/subject.service";
import {
  courseApiService,
  type CourseResponse,
} from "../services/course.service";
import {
  lessonApiService,
} from "../services/lesson.service";
import {
  moduleApiService,
  type ModuleResponse,
} from "../services/module.service";
import {
  contentBlockApiService,
  type ContentBlockResponse,
  type ContentBlockType,
} from "../services/contentBlock.service";
import brandLogo from "../assets/images/logo-completo-tu-profesor-transparent.png";
import brandMark from "../assets/images/logo-tu-profesor-transparent.png";

type WorkspaceTab = "courses" | "subjects" | "systems";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const getStatusLabel = (status: CourseResponse["status"]): string => {
  const labels: Record<CourseResponse["status"], string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ARCHIVED: "Archivado",
  };

  return labels[status];
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("courses");
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockResponse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [subjectName, setSubjectName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSubjectId, setCourseSubjectId] = useState("");
  const [courseSummary, setCourseSummary] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [blockType, setBlockType] = useState<ContentBlockType>("TEXT");
  const [blockTitle, setBlockTitle] = useState("");
  const [blockBody, setBlockBody] = useState("");
  const [blockImageUrl, setBlockImageUrl] = useState("");
  const [blockIsHighlight, setBlockIsHighlight] = useState(false);
  const [lessonTitleByModule, setLessonTitleByModule] = useState<
    Record<string, string>
  >({});

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const selectedLesson = useMemo(() => {
    return (
      modules
        .flatMap((moduleItem) =>
          (moduleItem.lessons ?? []).map((lesson) => ({
            ...lesson,
            moduleTitle: moduleItem.title,
          })),
        )
        .find((lesson) => lesson.id === selectedLessonId) ?? null
    );
  }, [modules, selectedLessonId]);

  const totalLessons = modules.reduce(
    (total, moduleItem) => total + (moduleItem._count?.lessons ?? 0),
    0,
  );

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    void loadWorkspace();
  }, [navigate]);

  useEffect(() => {
    if (!selectedCourseId) {
      setModules([]);
      setSelectedLessonId("");
      return;
    }

    void loadModulesByCourse(selectedCourseId);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedLessonId) {
      setContentBlocks([]);
      return;
    }

    void loadContentBlocksByLesson(selectedLessonId);
  }, [selectedLessonId]);

  const loadWorkspace = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    try {
      const [subjectsResponse, coursesResponse] = await Promise.all([
        subjectApiService.getSubjects(),
        courseApiService.getCourses(),
      ]);

      const nextSubjects = subjectsResponse.data ?? [];
      const nextCourses = coursesResponse.data ?? [];

      setSubjects(nextSubjects);
      setCourses(nextCourses);
      setCourseSubjectId(nextSubjects[0]?.id ?? "");
      setSelectedCourseId((current) => current || nextCourses[0]?.id || "");
    } catch (error: unknown) {
      setFeedbackMessage(
        getErrorMessage(error, "No se pudo cargar el estudio académico."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadModulesByCourse = async (courseId: string) => {
    try {
      const response = await moduleApiService.getModulesByCourse(courseId);
      const nextModules = response.data ?? [];

      setModules(nextModules);
      setSelectedLessonId((current) => {
        const currentLessonStillExists = nextModules.some((moduleItem) =>
          moduleItem.lessons?.some((lesson) => lesson.id === current),
        );

        if (current && currentLessonStillExists) {
          return current;
        }

        return nextModules[0]?.lessons?.[0]?.id ?? "";
      });
    } catch (error: unknown) {
      setFeedbackMessage(
        getErrorMessage(error, "No se pudo cargar la estructura del curso."),
      );
    }
  };

  const loadContentBlocksByLesson = async (lessonId: string) => {
    try {
      const response =
        await contentBlockApiService.getContentBlocksByLesson(lessonId);
      setContentBlocks(response.data ?? []);
    } catch (error: unknown) {
      setFeedbackMessage(
        getErrorMessage(error, "No se pudieron cargar los bloques."),
      );
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  const handleCreateSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectName.trim()) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await subjectApiService.createSubject(subjectName.trim());

      if (response.data) {
        setSubjects((current) => [response.data as SubjectResponse, ...current]);
        setCourseSubjectId((current) => current || response.data?.id || "");
        setSubjectName("");
        setFeedbackMessage("Materia creada correctamente.");
      }
    } catch (error: unknown) {
      setFeedbackMessage(
        getErrorMessage(error, "No se pudo crear la materia."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!courseTitle.trim() || !courseSubjectId) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await courseApiService.createCourse({
        title: courseTitle.trim(),
        subjectId: courseSubjectId,
        summary: courseSummary.trim() || undefined,
      });

      if (response.data) {
        const createdCourse = response.data;
        setCourses((current) => [createdCourse, ...current]);
        setSelectedCourseId(createdCourse.id);
        setCourseTitle("");
        setCourseSummary("");
        setFeedbackMessage("Curso creado y listo para estructurar.");
      }
    } catch (error: unknown) {
      setFeedbackMessage(getErrorMessage(error, "No se pudo crear el curso."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateModule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!moduleTitle.trim() || !selectedCourse) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await moduleApiService.createModule({
        title: moduleTitle.trim(),
        subjectId: selectedCourse.subjectId,
        courseId: selectedCourse.id,
        orderIndex: modules.length,
      });

      if (response.data) {
        setModules((current) => [...current, response.data as ModuleResponse]);
        setModuleTitle("");
        setFeedbackMessage("Módulo agregado al curso.");
      }
    } catch (error: unknown) {
      setFeedbackMessage(getErrorMessage(error, "No se pudo crear el módulo."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLesson = async (
    event: React.FormEvent,
    moduleItem: ModuleResponse,
  ) => {
    event.preventDefault();
    const title = lessonTitleByModule[moduleItem.id]?.trim();

    if (!title) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await lessonApiService.createLesson({
        title,
        moduleId: moduleItem.id,
        orderIndex: moduleItem._count?.lessons ?? moduleItem.lessons?.length ?? 0,
      });

      if (response.data) {
        const createdLesson = response.data;
        setModules((current) =>
          current.map((item) =>
            item.id === moduleItem.id
              ? {
                  ...item,
                  lessons: [...(item.lessons ?? []), createdLesson],
                  _count: {
                    lessons: (item._count?.lessons ?? 0) + 1,
                    contentBlocks: item._count?.contentBlocks ?? 0,
                  },
                }
              : item,
          ),
        );
        setLessonTitleByModule((current) => ({ ...current, [moduleItem.id]: "" }));
        setSelectedLessonId(createdLesson.id);
        setFeedbackMessage("Lección agregada al módulo.");
      }
    } catch (error: unknown) {
      setFeedbackMessage(getErrorMessage(error, "No se pudo crear la lección."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateContentBlock = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedLesson || !blockBody.trim()) return;

    const ownerModule = modules.find((moduleItem) =>
      moduleItem.lessons?.some((lesson) => lesson.id === selectedLesson.id),
    );

    if (!ownerModule) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await contentBlockApiService.createContentBlock({
        moduleId: ownerModule.id,
        lessonId: selectedLesson.id,
        type: blockType,
        appearanceOrder: contentBlocks.length,
        animationType: "fade-in",
        isHighlight: blockIsHighlight,
        contentPayload: {
          title: blockTitle.trim() || undefined,
          body: blockBody.trim(),
          imageUrl: blockImageUrl.trim() || undefined,
        },
      });

      const createdBlock = response.data;

      if (createdBlock) {
        setContentBlocks((current) => [...current, createdBlock]);
        setBlockTitle("");
        setBlockBody("");
        setBlockImageUrl("");
        setBlockIsHighlight(false);
        setFeedbackMessage("Bloque agregado a la lección.");
      }
    } catch (error: unknown) {
      setFeedbackMessage(getErrorMessage(error, "No se pudo crear el bloque."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveContentBlock = async (
    blockId: string,
    direction: "up" | "down",
  ) => {
    if (!selectedLesson) return;

    const currentIndex = contentBlocks.findIndex((block) => block.id === blockId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= contentBlocks.length) {
      return;
    }

    const reorderedBlocks = [...contentBlocks];
    [reorderedBlocks[currentIndex], reorderedBlocks[targetIndex]] = [
      reorderedBlocks[targetIndex],
      reorderedBlocks[currentIndex],
    ];

    const normalizedBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      appearanceOrder: index,
    }));

    setContentBlocks(normalizedBlocks);
    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const response = await contentBlockApiService.reorderLessonContentBlocks(
        selectedLesson.id,
        {
          items: normalizedBlocks.map((block) => ({
            id: block.id,
            appearanceOrder: block.appearanceOrder,
          })),
        },
      );

      setContentBlocks(response.data ?? normalizedBlocks);
      setFeedbackMessage("Secuencia de bloques actualizada.");
    } catch (error: unknown) {
      await loadContentBlocksByLesson(selectedLesson.id);
      setFeedbackMessage(
        getErrorMessage(error, "No se pudo reordenar la secuencia."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContentBlock = async (blockId: string) => {
    if (!selectedLesson) return;

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      await contentBlockApiService.deleteContentBlock(blockId);
      await loadContentBlocksByLesson(selectedLesson.id);
      setFeedbackMessage("Bloque eliminado de la lección.");
    } catch (error: unknown) {
      setFeedbackMessage(getErrorMessage(error, "No se pudo eliminar el bloque."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 bg-brand-blue text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="rounded-lg bg-white p-3">
              <img src={brandLogo} alt="Tu Profesor Particular" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase text-brand-green">
              Academic Studio
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {[
              { id: "courses", label: "Cursos", icon: LibraryBig },
              { id: "subjects", label: "Materias", icon: BookOpen },
              { id: "systems", label: "Sistemas 3D", icon: Boxes },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as WorkspaceTab)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-brand-blue"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-brand-green" : "text-white/70"
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={brandMark}
                    alt="Marca Tu Profesor Particular"
                    className="h-20 w-20 object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-green">
                    Neuroeducación guiada
                  </p>
                  <h1 className="text-2xl font-bold text-brand-blue">
                    Admin Studio
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StudioMetric label="Cursos" value={courses.length} />
                <StudioMetric label="Materias" value={subjects.length} />
                <StudioMetric label="Módulos" value={modules.length} />
                <StudioMetric label="Lecciones" value={totalLessons} />
              </div>
            </div>
          </header>

          <section className="p-5 lg:p-8">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]"
            >
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-green">
                      <Compass className="h-4 w-4" />
                      Fase 2
                    </p>
                    <h2 className="text-3xl font-bold text-brand-blue">
                      Construí cursos como recorridos vivos.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      Estructurá materias, cursos, módulos y lecciones con una
                      secuencia clara. Los bloques progresivos, simuladores y
                      experiencias 3D van a apoyarse sobre esta arquitectura.
                    </p>
                  </div>
                  <div className="rounded-lg border border-brand-green/20 bg-brand-green/10 p-4 text-sm text-brand-blue">
                    <Sparkles className="mb-2 h-5 w-5 text-brand-green" />
                    Precisión de compás, avance visible y contenido sin
                    sobrecarga cognitiva.
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-blue">
                  <Brain className="h-4 w-4 text-brand-green" />
                  Próximo bloque
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  Cuando esta estructura esté probada, seguimos con el editor de
                  bloques: texto, fórmula, imagen, quiz, gráficos 2D y escenas
                  3D interactivas.
                </p>
              </div>
            </motion.div>

            {feedbackMessage && (
              <div className="mb-6 rounded-lg border border-brand-green/20 bg-white p-4 text-sm font-semibold text-brand-blue shadow-sm">
                {feedbackMessage}
              </div>
            )}

            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-brand-green" />
                Cargando estudio académico...
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="space-y-6">
                  <StudioPanel
                    title="Nueva materia"
                    description="Crea el eje académico que va a organizar cursos y módulos."
                    icon={BookOpen}
                  >
                    <form onSubmit={handleCreateSubject} className="space-y-3">
                      <StudioInput
                        label="Nombre"
                        value={subjectName}
                        onChange={setSubjectName}
                        placeholder="Ej: Matemática"
                      />
                      <StudioButton disabled={isSaving || !subjectName.trim()}>
                        Crear materia
                      </StudioButton>
                    </form>
                  </StudioPanel>

                  <StudioPanel
                    title="Nuevo curso"
                    description="Define una experiencia de aprendizaje dentro de una materia."
                    icon={LibraryBig}
                  >
                    <form onSubmit={handleCreateCourse} className="space-y-3">
                      <label className="block text-sm font-semibold text-brand-blue">
                        Materia
                        <select
                          value={courseSubjectId}
                          onChange={(event) =>
                            setCourseSubjectId(event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                        >
                          {subjects.length === 0 && (
                            <option value="">Creá una materia primero</option>
                          )}
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <StudioInput
                        label="Título"
                        value={courseTitle}
                        onChange={setCourseTitle}
                        placeholder="Ej: Álgebra desde cero"
                      />
                      <StudioTextarea
                        label="Resumen"
                        value={courseSummary}
                        onChange={setCourseSummary}
                        placeholder="Una promesa clara del recorrido."
                      />
                      <StudioButton
                        disabled={isSaving || !courseTitle.trim() || !courseSubjectId}
                      >
                        Crear curso
                      </StudioButton>
                    </form>
                  </StudioPanel>
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-brand-blue">
                          Cursos activos
                        </h3>
                        <p className="text-sm text-slate-500">
                          Seleccioná un curso para construir su estructura.
                        </p>
                      </div>
                      <span className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-bold uppercase text-white">
                        Studio
                      </span>
                    </div>

                    {courses.length === 0 ? (
                      <EmptyState
                        title="Todavía no hay cursos"
                        description="Crea el primer curso para empezar a organizar módulos y lecciones."
                      />
                    ) : (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {courses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => setSelectedCourseId(course.id)}
                            className={`rounded-lg border p-4 text-left transition ${
                              selectedCourseId === course.id
                                ? "border-brand-green bg-brand-green/10"
                                : "border-slate-200 bg-white hover:border-brand-green/60"
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <h4 className="font-bold text-brand-blue">
                                {course.title}
                              </h4>
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                {getStatusLabel(course.status)}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm text-slate-500">
                              {course.summary || "Sin resumen todavía."}
                            </p>
                            <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                              <span>{course._count?.modules ?? 0} módulos</span>
                              <span>
                                {course._count?.enrollments ?? 0} alumnos
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-brand-blue">
                          {selectedCourse?.title || "Estructura del curso"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Módulos y lecciones listos para recibir bloques
                          progresivos.
                        </p>
                      </div>
                      {selectedCourse && (
                        <form
                          onSubmit={handleCreateModule}
                          className="flex flex-col gap-2 sm:flex-row"
                        >
                          <input
                            value={moduleTitle}
                            onChange={(event) =>
                              setModuleTitle(event.target.value)
                            }
                            placeholder="Nuevo módulo"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                          />
                          <button
                            type="submit"
                            disabled={isSaving || !moduleTitle.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar
                          </button>
                        </form>
                      )}
                    </div>

                    {!selectedCourse ? (
                      <EmptyState
                        title="Elegí o crea un curso"
                        description="La estructura aparece cuando hay un curso seleccionado."
                      />
                    ) : modules.length === 0 ? (
                      <EmptyState
                        title="Este curso aún no tiene módulos"
                        description="Agregá el primer módulo para iniciar la secuencia."
                      />
                    ) : (
                      <div className="space-y-4">
                        {modules.map((moduleItem, index) => (
                          <div
                            key={moduleItem.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-sm font-bold text-white">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-brand-blue">
                                    {moduleItem.title}
                                  </h4>
                                  <p className="text-sm text-slate-500">
                                    {moduleItem._count?.lessons ?? 0} lecciones ·{" "}
                                    {moduleItem._count?.contentBlocks ?? 0} bloques
                                  </p>
                                </div>
                              </div>

                              <form
                                onSubmit={(event) =>
                                  handleCreateLesson(event, moduleItem)
                                }
                                className="flex flex-col gap-2 sm:flex-row"
                              >
                                <input
                                  value={lessonTitleByModule[moduleItem.id] ?? ""}
                                  onChange={(event) =>
                                    setLessonTitleByModule((current) => ({
                                      ...current,
                                      [moduleItem.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Nueva lección"
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                                />
                                <button
                                  type="submit"
                                  disabled={
                                    isSaving ||
                                    !lessonTitleByModule[moduleItem.id]?.trim()
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-blue px-4 py-2 text-sm font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Plus className="h-4 w-4" />
                                  Lección
                                </button>
                              </form>
                            </div>

                            {moduleItem.lessons && moduleItem.lessons.length > 0 && (
                              <div className="mt-4 grid gap-2">
                                {moduleItem.lessons.map((lesson) => (
                                  <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => setSelectedLessonId(lesson.id)}
                                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                                      selectedLessonId === lesson.id
                                        ? "border-brand-green bg-brand-green/10"
                                        : "border-slate-200 bg-white hover:border-brand-green/60"
                                    }`}
                                  >
                                    <div>
                                      <p className="font-semibold text-brand-dark">
                                        {lesson.title}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {getStatusLabel(lesson.status)}
                                      </p>
                                    </div>
                                    <Wand2 className="h-4 w-4 text-brand-green" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2">
                      <p className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                        <Wand2 className="h-4 w-4" />
                        Fase 3 · Content Block Studio
                      </p>
                      <h3 className="text-lg font-bold text-brand-blue">
                        {selectedLesson
                          ? selectedLesson.title
                          : "Seleccioná una lección"}
                      </h3>
                      <p className="text-sm leading-6 text-slate-500">
                        Diseñá la clase en fragmentos progresivos. Cada bloque
                        aparece con calma, sostiene la atención y prepara el
                        terreno para simuladores y escenas 3D.
                      </p>
                    </div>

                    {!selectedLesson ? (
                      <EmptyState
                        title="Elegí una lección"
                        description="Seleccioná una lección dentro de un módulo para crear sus primeros bloques."
                      />
                    ) : (
                      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
                        <form
                          onSubmit={handleCreateContentBlock}
                          className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <label className="block text-sm font-semibold text-brand-blue">
                            Tipo de bloque
                            <select
                              value={blockType}
                              onChange={(event) =>
                                setBlockType(event.target.value as ContentBlockType)
                              }
                              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                            >
                              <option value="TEXT">Texto</option>
                              <option value="CALLOUT">Concepto clave</option>
                              <option value="FORMULA">Fórmula</option>
                              <option value="IMAGE">Imagen</option>
                              <option value="QUIZ">Pregunta rápida</option>
                              <option value="GRAPHIC_2D">Gráfico 2D</option>
                              <option value="GRAPHIC_3D">Escena 3D</option>
                            </select>
                          </label>

                          <StudioInput
                            label="Título interno"
                            value={blockTitle}
                            onChange={setBlockTitle}
                            placeholder="Ej: Idea central"
                          />

                          <StudioTextarea
                            label="Contenido"
                            value={blockBody}
                            onChange={setBlockBody}
                            placeholder="Escribí el fragmento que verá el alumno."
                          />

                          {blockType === "IMAGE" && (
                            <StudioInput
                              label="URL de imagen"
                              value={blockImageUrl}
                              onChange={setBlockImageUrl}
                              placeholder="https://..."
                            />
                          )}

                          <label className="flex items-center gap-3 rounded-lg border border-brand-green/20 bg-white px-3 py-3 text-sm font-semibold text-brand-blue">
                            <input
                              type="checkbox"
                              checked={blockIsHighlight}
                              onChange={(event) =>
                                setBlockIsHighlight(event.target.checked)
                              }
                              className="h-4 w-4 accent-brand-green"
                            />
                            Resaltar este bloque
                          </label>

                          <StudioButton disabled={isSaving || !blockBody.trim()}>
                            Agregar bloque
                          </StudioButton>
                        </form>

                        <div className="rounded-lg border border-slate-200 bg-brand-light p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-brand-blue">
                                Preview progresivo
                              </h4>
                              <p className="text-sm text-slate-500">
                                {selectedLesson.moduleTitle}
                              </p>
                            </div>
                            <Sparkles className="h-5 w-5 text-brand-green" />
                          </div>

                          {contentBlocks.length === 0 ? (
                            <EmptyState
                              title="Sin bloques todavía"
                              description="Agregá el primer fragmento para ver cómo respira la clase."
                            />
                          ) : (
                            <div className="space-y-3">
                              {contentBlocks.map((block, index) => (
                                <ContentBlockPreview
                                  key={block.id}
                                  block={block}
                                  index={index}
                                  canMoveUp={index > 0}
                                  canMoveDown={index < contentBlocks.length - 1}
                                  isSaving={isSaving}
                                  onMoveUp={() =>
                                    void handleMoveContentBlock(block.id, "up")
                                  }
                                  onMoveDown={() =>
                                    void handleMoveContentBlock(block.id, "down")
                                  }
                                  onDelete={() =>
                                    void handleDeleteContentBlock(block.id)
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

type StudioMetricProps = {
  label: string;
  value: number;
};

const getPayloadString = (
  payload: Record<string, unknown>,
  key: string,
): string => {
  const value = payload[key];

  return typeof value === "string" ? value : "";
};

type ContentBlockPreviewProps = {
  block: ContentBlockResponse;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isSaving: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

const ContentBlockPreview = ({
  block,
  index,
  canMoveUp,
  canMoveDown,
  isSaving,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ContentBlockPreviewProps) => {
  const title = getPayloadString(block.contentPayload, "title");
  const body = getPayloadString(block.contentPayload, "body");
  const imageUrl = getPayloadString(block.contentPayload, "imageUrl");
  const Icon =
    block.type === "IMAGE" ? Image : block.type === "FORMULA" ? Type : FileText;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        block.isHighlight
          ? "border-brand-green ring-2 ring-brand-green/10"
          : "border-slate-200"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Bloque {index + 1} · {block.type}
            </p>
            {title && <h5 className="font-bold text-brand-blue">{title}</h5>}
          </div>
        </div>
        {block.isHighlight && (
          <span className="rounded-lg bg-brand-green px-2 py-1 text-xs font-bold text-white">
            Clave
          </span>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <PreviewActionButton
          label="Subir"
          icon={ArrowUp}
          disabled={!canMoveUp || isSaving}
          onClick={onMoveUp}
        />
        <PreviewActionButton
          label="Bajar"
          icon={ArrowDown}
          disabled={!canMoveDown || isSaving}
          onClick={onMoveDown}
        />
        <PreviewActionButton
          label="Eliminar"
          icon={Trash2}
          disabled={isSaving}
          onClick={onDelete}
          tone="danger"
        />
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title || "Bloque visual"}
          className="mb-3 max-h-64 w-full rounded-lg object-cover"
        />
      )}

      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {body}
      </p>
    </motion.article>
  );
};

type PreviewActionButtonProps = {
  label: string;
  icon: typeof ArrowUp;
  disabled?: boolean;
  onClick: () => void;
  tone?: "neutral" | "danger";
};

const PreviewActionButton = ({
  label,
  icon: Icon,
  disabled = false,
  onClick,
  tone = "neutral",
}: PreviewActionButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      tone === "danger"
        ? "border-red-100 text-red-600 hover:bg-red-50"
        : "border-slate-200 text-brand-blue hover:border-brand-green hover:text-brand-green"
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

const StudioMetric = ({ label, value }: StudioMetricProps) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="text-xl font-bold text-brand-blue">{value}</p>
  </div>
);

type StudioPanelProps = {
  title: string;
  description: string;
  icon: typeof Layers;
  children: React.ReactNode;
};

const StudioPanel = ({
  title,
  description,
  icon: Icon,
  children,
}: StudioPanelProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-bold text-brand-blue">{title}</h3>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

type StudioInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

const StudioInput = ({
  label,
  value,
  onChange,
  placeholder,
}: StudioInputProps) => (
  <label className="block text-sm font-semibold text-brand-blue">
    {label}
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
    />
  </label>
);

type StudioTextareaProps = StudioInputProps;

const StudioTextarea = ({
  label,
  value,
  onChange,
  placeholder,
}: StudioTextareaProps) => (
  <label className="block text-sm font-semibold text-brand-blue">
    {label}
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={3}
      className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
    />
  </label>
);

type StudioButtonProps = {
  disabled: boolean;
  children: React.ReactNode;
};

const StudioButton = ({ disabled, children }: StudioButtonProps) => (
  <button
    type="submit"
    disabled={disabled}
    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
  >
    <Plus className="h-4 w-4" />
    {children}
  </button>
);

type EmptyStateProps = {
  title: string;
  description: string;
};

const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
    <Layers className="mx-auto mb-3 h-8 w-8 text-brand-green" />
    <h4 className="font-bold text-brand-blue">{title}</h4>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {description}
    </p>
  </div>
);
