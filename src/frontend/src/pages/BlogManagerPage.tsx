import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../store";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  publishedAt: string;
  isDraft: boolean;
  tags: string;
}

const CATEGORIES = [
  "Education",
  "Parenting",
  "Events",
  "Announcements",
  "Child Development",
];

const CATEGORY_COLORS: Record<string, string> = {
  Education: "bg-blue-100 text-blue-700",
  Parenting: "bg-pink-100 text-pink-700",
  Events: "bg-yellow-100 text-yellow-700",
  Announcements: "bg-teal-100 text-teal-700",
  "Child Development": "bg-green-100 text-green-700",
};

// Self-contained AI blog generator - no external API
function generateBlogContent(prompt: string): string {
  const lower = prompt.toLowerCase();

  const templates: { keywords: string[]; generate: () => string }[] = [
    {
      keywords: ["parenting", "parent", "raising", "children", "child"],
      generate:
        () => `Parenting in today's world comes with unique joys and challenges. Here are key insights every parent should know:

1. **Create Daily Routines** — Children thrive on predictability. Consistent morning and bedtime routines reduce anxiety and improve focus during the school day.

2. **Active Listening Builds Trust** — Put down devices and give your child your full attention when they speak. This simple act builds deep trust and encourages open communication.

3. **Encourage Mistakes as Learning** — Reframe failures as learning opportunities. When children hear "What did you discover from this?" instead of "Why did you fail?", they develop resilience.

4. **Limit Screen Time Intentionally** — Balance is key. Set family screen-free times—dinner, the first hour after school, and 30 minutes before bed.

5. **Read Together Every Day** — Even 15 minutes of shared reading expands vocabulary, builds empathy, and creates a positive association with learning.

At Mahara Schools, we believe the home and school are partners in every child's journey. Stay connected with us to support your child's best growth.`,
    },
    {
      keywords: [
        "school readiness",
        "kindergarten",
        "starting school",
        "nursery",
        "pre-school",
      ],
      generate:
        () => `Is your child ready for school? School readiness goes beyond knowing the alphabet. Here's what truly matters:

1. **Emotional Readiness** — Can your child separate from you calmly? Practice short separations and build confidence through play dates and group activities.

2. **Self-Care Skills** — Managing their lunchbox, shoes, and toilet needs independently frees up classroom time for actual learning.

3. **Language and Communication** — Encourage your child to express needs verbally, listen to others, and follow two-step instructions.

4. **Curiosity and Engagement** — Children who ask questions and show interest in the world around them adapt most easily to structured learning.

5. **Social Skills** — Sharing, taking turns, and basic conflict resolution are the foundations of a happy classroom experience.

Mahara Schools' Pre-Nursery and Nursery programmes are designed with exactly these milestones in mind. Speak to our centre head to learn more.`,
    },
    {
      keywords: [
        "learning at home",
        "home learning",
        "study",
        "homework",
        "activities",
      ],
      generate:
        () => `Making learning fun at home doesn't require expensive materials or hours of your time. Try these proven approaches:

1. **Kitchen Math** — Count ingredients, measure flour, divide portions. Real-world maths makes abstract concepts concrete and memorable.

2. **Story Dictation** — Ask your child to tell you a story. Write it down exactly as they say it. Read it back to them. This builds narrative thinking and shows that their words have power.

3. **Nature Journaling** — Take a notebook outside. Observe insects, leaves, clouds. Draw and label. Science, art, and writing in one simple activity.

4. **Audio Books on Journeys** — Transform commutes into learning time with age-appropriate audio books or educational podcasts.

5. **Question of the Day** — Pick a topic at dinner: How does rain form? Why is the sky blue? Google it together. Model curiosity.

Mahara Schools integrates these home-school connections into our weekly worksheets. Download this week's worksheet from the Parent Portal.`,
    },
    {
      keywords: [
        "child development",
        "development",
        "growth",
        "milestone",
        "stages",
      ],
      generate:
        () => `Understanding child development helps you support your child at every stage. Key milestones to watch for:

1. **Language Explosion (18 months–3 years)** — Vocabulary grows from 50 to 1,000+ words. Read aloud daily and narrate your actions to fuel this development.

2. **Symbolic Play (2–4 years)** — Pretend play signals a huge cognitive leap — the ability to let one thing represent another. Nurture this with open-ended toys.

3. **Theory of Mind (4–5 years)** — Children begin understanding that others have different thoughts and feelings. Roleplay and social stories support this empathy development.

4. **Reading Readiness (5–6 years)** — Look for interest in letters, attempts to write their name, and ability to rhyme. These signal the brain is ready for formal literacy.

5. **Executive Function (6–12 years)** — Planning, focus, and self-control develop through structured activities, games, and consistent expectations.

At Mahara Schools, our teachers are trained to recognise and support each of these stages. Speak to your child's teacher if you have any questions about their progress.`,
    },
    {
      keywords: ["event", "celebration", "festival", "occasion", "ceremony"],
      generate:
        () => `We're excited to share the latest from Mahara Schools. Our school community continues to grow stronger through shared celebrations and meaningful events.

School events are more than just activities — they are moments where children build lifelong memories, develop social confidence, and experience belonging to a community that cares.

What to look forward to:

1. **Cultural Celebrations** — We celebrate the full diversity of our school community through festivals that teach children to appreciate different traditions.

2. **Sports and Physical Activities** — Movement builds not just fitness but teamwork, resilience, and the experience of working toward a shared goal.

3. **Creative Showcases** — Art exhibitions, drama performances, and music recitals give every child a platform to shine.

4. **Parent-Teacher Meetings** — Our PTMs are thoughtfully structured conversations about your child's progress, not just report delivery.

5. **Community Service** — Age-appropriate service activities plant the seeds of empathy and civic responsibility.

Stay updated through the Parent Portal and your classroom teacher for specific dates and how to participate.`,
    },
    {
      keywords: ["activity", "craft", "art", "play", "games"],
      generate:
        () => `The best learning often looks like play. Here are classroom activity highlights that bring joy and learning together:

1. **Sensory Bins** — Rice, sand, or water with small objects hidden inside. Children develop fine motor skills and problem-solving as they explore.

2. **Collaborative Murals** — Large shared art projects build community, turn-taking, and an appreciation for each other's contributions.

3. **Storytelling Circles** — Each child adds a sentence to a growing group story. Imagination, listening, and narrative skills in one activity.

4. **Science Experiments** — Simple experiments like mixing colours or watching plants grow introduce the scientific method in an accessible way.

5. **Movement Games** — Simon Says, freeze dance, and obstacle courses aren't just fun — they develop body awareness, listening, and coordination.

Our teachers at Mahara Schools design each day's activities to be developmentally appropriate, engaging, and connected to the curriculum. See this week's activities in the Parent Portal.`,
    },
  ];

  for (const tpl of templates) {
    if (tpl.keywords.some((k) => lower.includes(k))) {
      return tpl.generate();
    }
  }

  // Generic template for any other prompt
  return `${prompt.charAt(0).toUpperCase() + prompt.slice(1)}: A Mahara Schools Perspective\n\nAt Mahara Schools, we believe every topic related to early childhood education deserves thoughtful consideration. Here are five key insights on this subject:\n\n1. **Start With Curiosity** — The most effective approach begins with understanding the child's perspective and current knowledge.

2. **Consistency Matters** — Regular, small efforts outperform occasional intensive sessions in building lasting skills and habits.

3. **Celebrate Progress, Not Perfection** — Acknowledge every step forward, no matter how small. Confidence grows from feeling seen and appreciated.

4. **Community Support** — Children flourish when home and school are in alignment. Open communication between parents and teachers is essential.

5. **The Role of Play** — Whatever the topic, creative and playful approaches unlock deeper engagement and better retention than passive instruction.

For more insights and resources, explore the Learning Hub in your Parent Portal, or reach out to your child's teacher directly.`;
}

export default function BlogManagerPage() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as any;
  const user = getAuthUser();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyPost: BlogPost = {
    id: `post-${Date.now()}`,
    title: "",
    content: "",
    category: "Education",
    authorName: user?.name ?? "Mahara Schools",
    publishedAt: "",
    isDraft: true,
    tags: "",
  };

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllBlogPosts()
      .then((ps: BlogPost[]) => setPosts(ps ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  async function handleSave(publish: boolean) {
    if (!actor || !selected) return;
    setSaving(true);
    try {
      const post: BlogPost = {
        ...selected,
        isDraft: !publish,
        publishedAt: publish ? new Date().toISOString() : selected.publishedAt,
      };
      const isNew = !posts.find((p) => p.id === post.id);
      if (isNew) {
        await actor.addBlogPost(post);
      } else {
        await actor.updateBlogPost(post);
      }
      const updated = await actor.getAllBlogPosts();
      setPosts(updated ?? []);
      setSelected(post);
      toast.success(publish ? "Post published!" : "Draft saved");
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!actor) return;
    try {
      await actor.deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleteId(null);
    }
  }

  function handleAIGenerate() {
    if (!aiPrompt.trim() || !selected) return;
    setGenerating(true);
    // Simulate a small delay for UX
    setTimeout(() => {
      const content = generateBlogContent(aiPrompt);
      setSelected((prev) => (prev ? { ...prev, content } : prev));
      setGenerating(false);
      toast.success("Content generated! Review and edit before publishing.");
    }, 800);
  }

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        data-ocid="blog.loading_state"
      >
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="col-span-2 h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[calc(100vh-160px)]">
      {/* Post list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <h2 className="font-semibold text-sm">
              Blog Posts ({posts.length})
            </h2>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() =>
              setSelected({ ...emptyPost, id: `post-${Date.now()}` })
            }
            data-ocid="blog.open_modal_button"
          >
            <Plus className="w-3 h-3" /> New Post
          </Button>
        </div>

        {posts.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="blog.empty_state"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No posts yet. Create one!</p>
          </div>
        ) : (
          <div className="space-y-1.5" data-ocid="blog.list">
            {posts.map((post, idx) => (
              <Card
                key={post.id}
                className={`cursor-pointer p-3 hover:shadow-sm transition-shadow ${
                  selected?.id === post.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelected(post)}
                data-ocid={`blog.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {post.title || "Untitled"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        className={`text-[9px] ${
                          CATEGORY_COLORS[post.category] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {post.category}
                      </Badge>
                      <Badge
                        className={`text-[9px] ${
                          post.isDraft
                            ? "bg-gray-100 text-gray-500"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {post.isDraft ? "Draft" : "Live"}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(post.id);
                    }}
                    data-ocid={`blog.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="md:col-span-2">
        {selected ? (
          <Card className="p-5 space-y-4 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={selected.title}
                  onChange={(e) =>
                    setSelected((p) =>
                      p ? { ...p, title: e.target.value } : p,
                    )
                  }
                  placeholder="Enter post title..."
                  className="mt-1"
                  data-ocid="blog.input"
                />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={selected.category}
                  onValueChange={(v) =>
                    setSelected((p) => (p ? { ...p, category: v } : p))
                  }
                >
                  <SelectTrigger className="mt-1" data-ocid="blog.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={selected.tags}
                onChange={(e) =>
                  setSelected((p) => (p ? { ...p, tags: e.target.value } : p))
                }
                placeholder="e.g. parenting, reading, kindergarten"
                className="mt-1"
              />
            </div>

            {/* AI Assist */}
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  AI Content Generator
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder='Enter a topic, e.g. "child development", "parenting tips"...'
                  className="flex-1 h-8 text-xs"
                  data-ocid="blog.ai_input"
                  onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
                />
                <Button
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleAIGenerate}
                  disabled={generating || !aiPrompt.trim()}
                  data-ocid="blog.ai_generate_button"
                >
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Generate
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                AI will generate structured content based on your topic. Review
                and edit before publishing.
              </p>
            </div>

            <div>
              <Label className="text-xs">Content</Label>
              <Textarea
                value={selected.content}
                onChange={(e) =>
                  setSelected((p) =>
                    p ? { ...p, content: e.target.value } : p,
                  )
                }
                placeholder="Write your blog post here, or use AI Generate above..."
                className="mt-1 resize-none"
                style={{ minHeight: "240px" }}
                data-ocid="blog.textarea"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={!selected.isDraft}
                  onCheckedChange={(v) =>
                    setSelected((p) => (p ? { ...p, isDraft: !v } : p))
                  }
                  data-ocid="blog.toggle"
                />
                <Label className="text-xs cursor-pointer">
                  {selected.isDraft ? "Draft" : "Published"}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  data-ocid="blog.save_button"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1" />
                  )}
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  data-ocid="blog.submit_button"
                >
                  Publish Post
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <div>
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a post to edit</p>
              <p className="text-xs mt-1">
                Or create a new post with the button above
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50 cursor-default"
            onClick={() => setDeleteId(null)}
            onKeyDown={(e) => e.key === "Escape" && setDeleteId(null)}
          />
          <Card
            className="relative z-10 p-6 max-w-sm w-full mx-4 space-y-4"
            data-ocid="blog.dialog"
          >
            <h3 className="font-semibold text-base">Delete Post?</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(null)}
                data-ocid="blog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteId)}
                data-ocid="blog.confirm_button"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
