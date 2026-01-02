import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Copy, Pencil } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi, How are you?" }] },
        { role: 'user', parts: [{ text: "I am Good" }] }
    ]);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState("");

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        setMessages(prev => [...prev, { role: "user", parts: [{ text: data.message }] }]);
        reset();

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: messages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [
                ...prev,
                { role: "model", parts: [{ text: response.data.message }] }
            ]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [
                ...prev,
                { role: "model", parts: [{ text: "Error from AI Chatbot" }] }
            ]);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditText(messages[index].parts[0].text);
    };

    const saveEdit = () => {
        const updated = [...messages];
        updated[editingIndex].parts[0].text = editText;
        setMessages(updated);
        setEditingIndex(null);
    };

    return (
        <div className="w-full h-full border rounded-xl shadow-lg bg-base-100 flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="p-4 border-b bg-base-200 flex items-center gap-2 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                        <div className={`chat-bubble text-base shadow-md relative ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                            {editingIndex === index ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                    />
                                    <button className="btn btn-sm btn-success" onClick={saveEdit}>Save</button>
                                </div>
                            ) : (
                                <>
                                    {msg.parts[0].text}
                                    {msg.role === "user" && (
                                        <div className="absolute top-11 right-1 flex gap-2">
                                            <button className="btn btn-xs p-1" onClick={() => handleCopy(msg.parts[0].text)}>
                                                <Copy size={14} />
                                            </button>
                                            <button className="btn btn-xs p-1" onClick={() => handleEdit(index)}>
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT BAR */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-3 border-t bg-base-200">
                <div className="flex gap-2">
                    <input
                        placeholder="Ask me anything..."
                        className="input input-bordered w-full focus:outline-none"
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button type="submit" className="btn btn-primary" disabled={errors.message}>
                        <Send size={20} />
                    </button>
                </div>
            </form>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
            `}</style>
        </div>
    );
}

export default ChatAi;
