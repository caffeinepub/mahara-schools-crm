import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckCheck, Clock, MessageCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useActor } from "../hooks/useActor";

interface WaMessage {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  direction: string;
  messageText: string;
  status: string;
  timestamp: string;
  messageId: string;
  campaignId: string;
}

interface Conversation {
  leadId: string;
  leadName: string;
  leadPhone: string;
  messages: WaMessage[];
  lastMessage: WaMessage;
  unreadCount: number;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "read")
    return <CheckCheck className="w-3.5 h-3.5" style={{ color: "#4FC3F7" }} />;
  if (status === "delivered")
    return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
  if (status === "sent") return <Check className="w-3.5 h-3.5 text-gray-400" />;
  return <Clock className="w-3.5 h-3.5 text-gray-300" />;
}

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDate(ts: string) {
  try {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function WhatsAppHistoryPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getWhatsAppMessages()
      .then((msgs: WaMessage[]) => setMessages(msgs ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [actor]);

  const conversations: Conversation[] = useMemo(() => {
    const map = new Map<string, WaMessage[]>();
    for (const m of messages) {
      const arr = map.get(m.leadId) ?? [];
      arr.push(m);
      map.set(m.leadId, arr);
    }
    return Array.from(map.entries())
      .map(([leadId, msgs]) => {
        const sorted = [...msgs].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        return {
          leadId,
          leadName: sorted[0].leadName,
          leadPhone: sorted[0].leadPhone,
          messages: sorted,
          lastMessage: sorted[sorted.length - 1],
          unreadCount: sorted.filter(
            (m) => m.direction === "inbound" && m.status !== "read",
          ).length,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessage.timestamp).getTime() -
          new Date(a.lastMessage.timestamp).getTime(),
      );
  }, [messages]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) =>
        c.leadName.toLowerCase().includes(search.toLowerCase()),
      ),
    [conversations, search],
  );

  const selectedConversation = conversations.find(
    (c) => c.leadId === selectedLeadId,
  );

  return (
    <div className="flex h-[calc(100vh-112px)] rounded-xl border border-border bg-card overflow-hidden shadow-card">
      {/* Left panel: conversation list */}
      <div
        className={`flex flex-col w-full md:w-80 flex-shrink-0 border-r border-border ${
          selectedLeadId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">
                WhatsApp History
              </h2>
              <p className="text-xs text-muted-foreground">
                {conversations.length} conversations
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-8 h-8 text-sm"
              data-ocid="whatsapp.search_input"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-3 space-y-3" data-ocid="whatsapp.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center p-8 text-center"
              data-ocid="whatsapp.empty_state"
            >
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Messages sent via campaigns will appear here.
              </p>
            </div>
          ) : (
            <div className="p-1">
              {filteredConversations.map((conv, idx) => (
                <button
                  type="button"
                  key={conv.leadId}
                  data-ocid={`whatsapp.item.${idx + 1}`}
                  onClick={() => setSelectedLeadId(conv.leadId)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors mb-0.5 ${
                    selectedLeadId === conv.leadId
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                    style={{ background: "#25D366" }}
                  >
                    {conv.leadName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-medium text-sm text-foreground truncate">
                        {conv.leadName}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatDate(conv.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage.direction === "outbound" ? (
                          <span className="inline-flex items-center gap-1">
                            <StatusIcon status={conv.lastMessage.status} />
                            {conv.lastMessage.messageText}
                          </span>
                        ) : (
                          conv.lastMessage.messageText
                        )}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge
                          className="ml-2 h-4 min-w-4 px-1 text-[9px] flex-shrink-0"
                          style={{ background: "#25D366", color: "white" }}
                        >
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right panel: chat thread */}
      {selectedConversation ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setSelectedLeadId(null)}
            >
              ←
            </Button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ background: "#25D366" }}
            >
              {selectedConversation.leadName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                {selectedConversation.leadName}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.leadPhone}
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" style={{ background: "#ECE5DD" }}>
            <div className="space-y-2 max-w-2xl mx-auto">
              {selectedConversation.messages.map((msg) => {
                const isOutbound = msg.direction === "outbound";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOutbound ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                        isOutbound ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                      style={{
                        background: isOutbound ? "#DCF8C6" : "#FFFFFF",
                      }}
                    >
                      <p className="text-sm text-gray-800 leading-snug whitespace-pre-wrap">
                        {msg.messageText}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                        {isOutbound && <StatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#ECE5DD" }}
            >
              <MessageCircle className="w-8 h-8" style={{ color: "#25D366" }} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Select a conversation
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a lead to view their WhatsApp thread
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
