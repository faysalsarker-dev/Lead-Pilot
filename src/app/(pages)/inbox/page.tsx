"use client";

import { useState } from "react";
import { useGetConversationsQuery } from "@/redux/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Mail,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Archive,
  Trash2,
  Flag,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  leadEmail: string;
  leadName: string;
  subject: string;
  lastMessage: string;
  messageCount: number;
  status: "UNREAD" | "READ" | "REPLIED";
  createdAt: string;
  updatedAt: string;
}

type ConversationFilter = "all" | "unread" | "read" | "replied";

function isConversationFilter(value: string): value is ConversationFilter {
  return ["all", "unread", "read", "replied"].includes(value);
}

// Mock data for demonstration
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    leadEmail: "john@acmecorp.com",
    leadName: "John Smith",
    subject: "Re: PitchPilot Integration",
    lastMessage: "Thanks for reaching out! This looks interesting. Can you send me more details?",
    messageCount: 3,
    status: "UNREAD",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    leadEmail: "sarah@techstartup.io",
    leadName: "Sarah Johnson",
    subject: "Question about pricing",
    lastMessage: "How much does the pro plan cost?",
    messageCount: 2,
    status: "UNREAD",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-3",
    leadEmail: "mike@enterprise.com",
    leadName: "Mike Chen",
    subject: "Schedule a demo?",
    lastMessage: "I'd love to see a demo of your platform. Are you available next week?",
    messageCount: 5,
    status: "READ",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-4",
    leadEmail: "emma@designco.net",
    leadName: "Emma Wilson",
    subject: "Re: Special offer",
    lastMessage: "Can you apply the offer to our annual plan?",
    messageCount: 4,
    status: "REPLIED",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-5",
    leadEmail: "alex@ecommerce.shop",
    leadName: "Alex Rodriguez",
    subject: "Integration support",
    lastMessage: "The API integration is working well. Thanks for the quick support!",
    messageCount: 6,
    status: "REPLIED",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "UNREAD":
      return "bg-red-100 text-red-800";
    case "READ":
      return "bg-blue-100 text-blue-800";
    case "REPLIED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function ConversationRow({
  conversation,
  onSelect,
}: {
  conversation: Conversation;
  onSelect: (conv: Conversation) => void;
}) {
  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
        conversation.status === "UNREAD" ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{conversation.leadName}</h3>
            <Badge className={getStatusColor(conversation.status)}>{conversation.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{conversation.leadEmail}</p>
          <p className="text-sm mt-2 line-clamp-1">{conversation.subject}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{conversation.lastMessage}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {conversation.messageCount} messages
            </span>
            <span>{formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Flag className="mr-2 h-4 w-4" />
              Mark as Important
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>("all");

  // Filter conversations
  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) => {
    const matchesSearch =
      conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.leadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && conv.status.toLowerCase() === filter;
  });

  const unreadCount = MOCK_CONVERSATIONS.filter((c) => c.status === "UNREAD").length;
  const readCount = MOCK_CONVERSATIONS.filter((c) => c.status === "READ").length;
  const repliedCount = MOCK_CONVERSATIONS.filter((c) => c.status === "REPLIED").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground mt-2">
          View and manage email conversations from your leads
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{MOCK_CONVERSATIONS.length}</div>
            <p className="text-sm text-muted-foreground">Total Conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-sm text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{readCount}</div>
            <p className="text-sm text-muted-foreground">Read</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{repliedCount}</div>
            <p className="text-sm text-muted-foreground">Replied</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your email conversations with leads</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Search and Filters */}
              <div className="p-4 border-b space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Tabs */}
                <Tabs
                  value={filter}
                  onValueChange={(value) => {
                    if (isConversationFilter(value)) {
                      setFilter(value);
                    }
                  }}
                >
                  <TabsList className="w-full justify-start bg-transparent border-b rounded-none">
                    <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent">
                      Unread ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="read" className="rounded-none border-b-2 border-transparent">
                      Read ({readCount})
                    </TabsTrigger>
                    <TabsTrigger value="replied" className="rounded-none border-b-2 border-transparent">
                      Replied ({repliedCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Conversations */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      onSelect={setSelectedConversation}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Detail */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedConversation ? "Conversation Details" : "Select a Conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">From</p>
                    <p className="font-medium">{selectedConversation.leadName}</p>
                    <p className="text-sm text-muted-foreground">{selectedConversation.leadEmail}</p>
                  </div>

                  {/* Subject */}
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Subject</p>
                    <p className="font-medium text-sm">{selectedConversation.subject}</p>
                  </div>

                  {/* Status */}
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Status</p>
                    <Badge className={getStatusColor(selectedConversation.status)}>
                      {selectedConversation.status}
                    </Badge>
                  </div>

                  {/* Message Count */}
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Messages</p>
                    <p className="font-medium">{selectedConversation.messageCount} messages</p>
                  </div>

                  {/* Last Message */}
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Last Message</p>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{selectedConversation.lastMessage}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Button className="w-full" variant="default">
                      Reply
                    </Button>
                    <Button className="w-full" variant="outline">
                      View Full Conversation
                    </Button>
                    <Button className="w-full" variant="outline">
                      Link to Lead
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a conversation to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
