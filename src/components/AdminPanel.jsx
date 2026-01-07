import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";

/* ---------------- ZOD SCHEMA ---------------- */
const problemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),

  tags: z.array(
    z.enum(["array", "linkedList", "graph", "dp"])
  ).min(1),

  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1),
      explanation: z.string().min(1)
    })
  ).min(1),

  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1)
    })
  ).min(1),

  startCode: z.array(
    z.object({
      language: z.enum(["cpp", "java", "javascript"]),
      initialCode: z.string().min(1)
    })
  ).length(3),

  referenceSolution: z.array(
    z.object({
      language: z.enum(["cpp", "java", "javascript"]),
      completeCode: z.string().min(1)
    })
  ).length(3)
});


/* ---------------- COMPONENT ---------------- */
function AdminPanel() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
  resolver: zodResolver(problemSchema),
  defaultValues: {
    tags: ["array"],   // ✅ REQUIRED
    startCode: [
      { language: "cpp", initialCode: "" },
      { language: "java", initialCode: "" },
      { language: "javascript", initialCode: "" }
    ],
    referenceSolution: [
      { language: "cpp", completeCode: "" },
      { language: "java", completeCode: "" },
      { language: "javascript", completeCode: "" }
    ],
    visibleTestCases: [{ input: "", output: "", explanation: "" }],
    hiddenTestCases: [{ input: "", output: "" }]
  }
});


  const { fields: visibleFields, append: addVisible, remove: removeVisible } =
    useFieldArray({ control, name: "visibleTestCases" });

  const { fields: hiddenFields, append: addHidden, remove: removeHidden } =
    useFieldArray({ control, name: "hiddenTestCases" });

  /* ---------------- SUBMIT ---------------- */
const onSubmit = async (data) => {
  try {
    await axiosClient.post("/problem/admin/create", data);
    alert("Problem created successfully ✅");
    navigate("/");
  } catch (err) {
    alert(err.response?.data?.message || "Problem create failed ❌");
  }
};



  /* ---------------- UI ---------------- */
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* BASIC INFO */}
        <div className="card bg-base-100 shadow p-6 space-y-4">
          <input {...register("title")} placeholder="Title" className="input input-bordered" />
          <textarea {...register("description")} placeholder="Description" className="textarea textarea-bordered" />

          <div className="flex gap-4">
            <select {...register("difficulty")} className="select select-bordered w-1/2">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

<select {...register("tags.0")} className="select select-bordered w-1/2">
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
          </div>
        </div>

        {/* VISIBLE TEST CASES */}
        <div className="card bg-base-100 shadow p-6">
          <h2 className="font-semibold mb-2">Visible Test Cases</h2>
          {visibleFields.map((field, i) => (
  <div key={field.id} className="space-y-2">
              <input {...register(`visibleTestCases.${i}.input`)} placeholder="Input" className="input input-bordered w-full" />
              <input {...register(`visibleTestCases.${i}.output`)} placeholder="Output" className="input input-bordered w-full" />
              <textarea {...register(`visibleTestCases.${i}.explanation`)} placeholder="Explanation" className="textarea textarea-bordered w-full" />
              <button type="button" onClick={() => removeVisible(i)} className="btn btn-xs btn-error">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addVisible({ input: "", output: "", explanation: "" })} className="btn btn-sm btn-primary mt-2">
            Add Visible Case
          </button>
        </div>

        {/* HIDDEN TEST CASES */}
        <div className="card bg-base-100 shadow p-6">
          <h2 className="font-semibold mb-2">Hidden Test Cases</h2>
         {hiddenFields.map((field, i) => (
  <div key={field.id} className="space-y-2">

              <input {...register(`hiddenTestCases.${i}.input`)} placeholder="Input" className="input input-bordered w-full" />
              <input {...register(`hiddenTestCases.${i}.output`)} placeholder="Output" className="input input-bordered w-full" />
              <button type="button" onClick={() => removeHidden(i)} className="btn btn-xs btn-error">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addHidden({ input: "", output: "" })} className="btn btn-sm btn-primary mt-2">
            Add Hidden Case
          </button>
        </div>

        {/* CODE */}
        <div className="card bg-base-100 shadow p-6 space-y-6">
          {[
            { label: "C++", key: "cpp" },
            { label: "Java", key: "java" },
            { label: "JavaScript", key: "javascript" }
          ].map((lang, i) => (
            <div key={lang.key}>
              <h3 className="font-semibold">{lang.label}</h3>
              <textarea {...register(`startCode.${i}.initialCode`)} placeholder="Initial Code" className="textarea textarea-bordered w-full" />
              <textarea {...register(`referenceSolution.${i}.completeCode`)} placeholder="Reference Solution" className="textarea textarea-bordered w-full mt-2" />
            </div>
          ))}
        </div>

        <button className="btn btn-primary w-full">Create Problem</button>
      </form>
    </div>
  );
}

export default AdminPanel;
