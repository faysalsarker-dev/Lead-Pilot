"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAddMessageMutation, useGetConversationQuery, useGetLeadQuery } from "@/redux/hooks";

export default function InboxThreadPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { data: leadData, isLoading: leadLoading } = useGetLeadQuery(leadId);
  const { data: conversationData, isLoading: conversationLoading } = useGetConversationQuery(leadId);
  const [addMessage, { isLoading: isSending }] = useAddMessageMutation();
  const lead = leadData?.data;
  const messages = conversationData?.data.messages || [];

  async function handleSend() {
    if (!body.trim()) {
      toast.error("Write a reply before sending");
      return;
    }

    try {
      await addMessage({
        leadId,
        data: {
          role: "user",
          subject: subject || undefined,
          body,
        },
      }).unwrap();
      setSubject("");
      setBody("");
      toast.success("Reply added to conversation");
    } catch {
      toast.error("Failed to send reply");
    }
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0">
            <Link href="/inbox"><ArrowLeft className="h-4 w-4" />Back to Inbox</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {leadLoading ? "Conversation" : lead?.name || "Conversation"}
            </h1>
            <p className="text-muted-foreground mt-2">{lead?.email || "Lead conversation thread"}</p>
          </div>
        </div>
        {lead && (
          <Button asChild variant="outline">
            <Link href={`/leads/${lead.id}`}>View Lead</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>{messages.length} message{messages.length === 1 ? "" : "s"} in this thread.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversationLoading && <Skeleton className="h-72 w-full" />}
            {!conversationLoading && messages.length === 0 && (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No messages have been recorded for this lead yet.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.sentAt}-${index}`}
                className={`max-w-[90%] rounded-lg border p-4 ${message.role === "user" ? "ml-auto bg-primary/5" : "bg-muted/40"}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge variant={message.role === "user" ? "default" : "secondary"}>
                    {message.role === "user" ? "You" : lead?.name || "Lead"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</span>
                </div>
                {message.subject && <p className="mb-2 text-sm font-semibold">{message.subject}</p>}
                <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription>Add an outbound message to this conversation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Re: Your question" />
            </div>
            <div className="space-y-2">
              <label htmlFor="body" className="text-sm font-medium">Message</label>
              <Textarea id="body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-56 resize-none" placeholder="Write your reply..." />
            </div>
            <Button onClick={handleSend} disabled={isSending} className="w-full gap-2">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Reply
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
