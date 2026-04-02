import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../../types";

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
  coverGradient: string;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "Building a Love for Reading Early",
    category: "Learning Activities",
    readTime: "6 min read",
    excerpt:
      "The habits children form around books in their earliest years shape their relationship with reading for life.",
    coverGradient: "from-teal-400 to-cyan-600",
    content: [
      "Reading aloud to your child is one of the most powerful things you can do as a parent. Studies consistently show that children who are read to regularly from birth develop stronger language skills, larger vocabularies, and a deeper love of stories compared to their peers.",
      "Start with simple board books that have high-contrast images and repetitive text. Babies as young as six months can begin to associate the warm, comforting experience of being held by a parent with the act of looking at a book together.",
      "As your child grows into a toddler, choose books with rich, varied vocabulary. Don't shy away from words they might not know — explain them naturally in context. 'The elephant is enormous. Enormous means very, very big!' This kind of conversational reading builds comprehension far better than simplified language.",
      "Create reading rituals rather than routines. A bedtime story feels special because it happens every evening in a cosy setting. Some families read after lunch, or have a Sunday morning book time. The consistency matters more than the timing.",
      "Let your child choose books freely, even if they pick the same one thirty times in a row. Repetition is how young children learn — they're not bored, they're absorbing. When they've memorised a favourite book and 'read' it back to you, that's a milestone worth celebrating.",
      "Visit your local library regularly and make it an event. Let children pick their own selections, get their own library card, and feel ownership of their reading choices. Children who feel agency over what they read are far more motivated to actually read.",
      "Model reading yourself. Children who see adults reading for pleasure — not just for work — internalise the message that books are enjoyable. Even ten minutes of quiet reading side by side sends a powerful signal.",
      "If your child resists books, try comics, graphic novels, magazines about topics they love, or non-fiction about dinosaurs, space, or animals. The format matters far less than the habit of engaging with text for pleasure.",
    ],
  },
  {
    id: "2",
    title: "How to Support Your Child's Emotional Intelligence",
    category: "Early Childhood",
    readTime: "7 min read",
    excerpt:
      "Emotional intelligence — the ability to understand and manage feelings — is a stronger predictor of success than IQ alone.",
    coverGradient: "from-purple-400 to-indigo-600",
    content: [
      "Emotional intelligence, often called EQ, encompasses the ability to recognise, understand, and manage one's own emotions, as well as to empathise with others. Research by psychologist Daniel Goleman suggests that EQ is a stronger predictor of life success, healthy relationships, and wellbeing than academic intelligence alone.",
      "The foundation is naming emotions. When your toddler melts down because their biscuit broke, resist the urge to immediately fix the problem. Instead, kneel to their level and say, 'You're really upset because your biscuit broke. That's so frustrating.' This simple act of naming the emotion teaches children that feelings have words and that those feelings are valid.",
      "Avoid dismissing or punishing emotions. Phrases like 'stop crying', 'don't be angry', or 'you're fine' teach children that their feelings are wrong or inconvenient. Over time, children who are regularly dismissed learn to suppress their emotions — which doesn't make the feelings go away, it just makes them harder to manage.",
      "Help children identify feelings in stories and real life. 'Look at that character's face — how do you think she's feeling?' or 'Your friend cried when she fell. What do you think was going through her mind?' Building this reflective habit is the essence of empathy.",
      "Teach regulation strategies, not just awareness. Deep breathing, counting to ten, going to a 'calm corner', or squeezing a stress ball are tools children can use when overwhelmed. Practise these during calm moments so they're available when strong emotions arrive.",
      "Be transparent about your own emotions in age-appropriate ways. 'I'm feeling a bit stressed today because I have a lot to do' models that adults have feelings too and that it's normal to acknowledge them. Equally, 'I took some deep breaths and now I feel better' shows how regulation works.",
      "Praise effort and strategies, not just outcomes. 'I'm so proud of how you used your words to tell your friend you were upset' reinforces that emotional skills are valuable and praiseworthy.",
      "Remember that emotional intelligence develops over years. A four-year-old throwing a tantrum isn't failing — they genuinely lack the neurological development to self-regulate under stress. Your patient, consistent response is literally building new neural pathways in their developing brain.",
    ],
  },
  {
    id: "3",
    title: "The Power of Play: Why Unstructured Play Matters",
    category: "Child Development",
    readTime: "5 min read",
    excerpt:
      "In a world of structured classes and screens, free play is becoming rare — yet it remains essential for child development.",
    coverGradient: "from-lime-400 to-green-600",
    content: [
      "Free, unstructured play — the kind where children decide what to do, make the rules, solve the problems, and follow their imagination without adult direction — is one of the most important activities of childhood. And it's increasingly rare.",
      "When children play freely, they are doing something profoundly educational. A group of five-year-olds building a fort with cushions are simultaneously negotiating roles, solving structural problems, managing conflict, sustaining attention, and experiencing joy. No curriculum delivers all of this at once.",
      "Play is how children process the world. After a difficult day, children often play out scenarios that mirror what confused or upset them. A child playing 'doctor and patient' after a hospital visit is integrating that experience. This kind of processing is essential for emotional health.",
      "Outdoor unstructured play has additional benefits. Natural environments present open-ended challenges — trees to climb, mud to dig, insects to study — that foster independence, risk assessment, and a deep connection with the natural world. Children who play outdoors regularly show lower levels of anxiety and better attention spans.",
      "Resist the urge to over-schedule. Children who have every hour filled with lessons, classes, and structured activities may be gaining specific skills, but they're losing the experience of boredom — which is actually a powerful creative trigger. When children say 'I'm bored', they're on the edge of inventing something.",
      "Your role as a parent during free play is minimal. Set up an environment that's safe and rich with open-ended materials — blocks, art supplies, fabric, cardboard boxes — then step back. Resist the temptation to join, direct, or improve. Observe with delight from a distance.",
      "Mixed-age play is particularly valuable. When older and younger children play together, the older ones practise leadership, patience, and teaching, while younger ones are stretched to keep up. This is how multi-generational communities have raised children for millennia.",
      "Protect time for play as fiercely as you protect homework and lessons. A child who gets home from school needs time to decompress, run around, and follow their own imagination before facing any more structured demands. This isn't wasted time — it's essential recovery and development.",
    ],
  },
  {
    id: "4",
    title: "Helping Your Child Transition to School",
    category: "School Readiness",
    readTime: "6 min read",
    excerpt:
      "Starting school is one of the biggest transitions of early childhood. Thoughtful preparation makes all the difference.",
    coverGradient: "from-yellow-400 to-orange-500",
    content: [
      "The transition to school is a significant milestone — for children and parents alike. For many children, it's their first experience of a structured environment with unfamiliar adults and peers, away from the safety of home. How you prepare them and support them through this transition can set the tone for years of schooling.",
      "Practical independence matters more than academic preparation. Before starting school, children benefit enormously from being able to manage their own belongings, open their lunchbox independently, manage their toilet needs, and put on and take off their shoes. These practical skills free up cognitive and emotional bandwidth on busy school days.",
      "Familiarise them with the school environment before day one. Visit the playground, walk through the gate, meet the teacher if possible. The unfamiliar becomes less threatening when it has been encountered before. Many schools offer orientation visits — take them up on every opportunity.",
      "Read books about starting school together and talk about it naturally. 'What do you think your classroom will be like?' and 'What might you enjoy most?' help children mentally rehearse and look forward to the experience rather than dreading the unknown.",
      "Practise separating calmly. If your child struggles with separation, start practising with short separations in trusted environments — dropping them at a relative's house, or at a play group. A consistent, brief and cheerful goodbye ritual helps enormously. Prolonged goodbyes amplify anxiety.",
      "Validate the feelings without catastrophising. 'It's normal to feel a bit nervous about something new. I felt nervous too when I started things. And you know what? You've done hard things before and you've always been okay.' This acknowledges reality while building confidence.",
      "Keep after-school time quiet and low-demand. School is exhausting — socially, cognitively, and physically. Many children are on their best behaviour all day and 'let it all out' at home. After-school meltdowns are common and normal. What children need is a snack, downtime, and a non-pressured reconnection with you.",
      "Stay in close communication with the teacher, especially in the first weeks. A quick daily check-in lets you catch small concerns before they become big problems, and helps you talk knowledgeably to your child about their day. 'Mrs Nair said you helped tidy up today — that was kind!'",
    ],
  },
  {
    id: "5",
    title: "Screen Time and Young Children: Finding the Balance",
    category: "Parenting Tips",
    readTime: "5 min read",
    excerpt:
      "Screens are part of modern life, but the quality and context of screen use matters far more than the raw minutes.",
    coverGradient: "from-pink-400 to-rose-600",
    content: [
      "The debate around screen time can feel overwhelming for parents — one study says screens are harmful, another says interactive apps support learning. The reality is more nuanced than either extreme suggests.",
      "Context matters enormously. A child passively watching low-quality cartoons for two hours is having a very different experience from a child watching a cooking show with their parent and then going to the kitchen to try the recipe. The same device can deliver junk or richness depending on how it's used.",
      "For children under two, video chatting with family members is the notable exception to limiting screens. Babies can and do learn from live video interaction with familiar people. What they don't learn from is passive screen content — their brains require real, contingent social interaction to acquire language.",
      "The World Health Organization recommends no screens for children under two (except video calling), and no more than one hour per day of high-quality programming for ages two to five. These are guidelines, not laws, but they reflect the understanding that young children learn best through physical, social, and sensory interaction.",
      "High-quality programming is characterised by slow pacing, repetition, clear language, and content that invites participation. Shows that ask questions, pause for responses, and model problem-solving support active rather than passive viewing.",
      "Establish screen-free zones and times. The dinner table, the bedroom, and the hour before bed are worth protecting. Blue light affects melatonin production, and stimulating content makes it harder to wind down. A consistent screen-off time at least an hour before sleep dramatically improves sleep quality in children.",
      "Be a media co-pilot rather than an absent gatekeeper. Watch with your child when possible. Ask questions. Make connections. 'That character was unkind — what do you think he should have done instead?' turns passive viewing into active moral reasoning.",
      "Model the behaviour you want to see. If children regularly see adults checking phones during meals or conversations, they learn that screens take priority over people. Being intentional about your own device use is one of the most powerful tools you have.",
    ],
  },
  {
    id: "6",
    title: "How Nutrition Affects Learning and Focus",
    category: "Child Development",
    readTime: "5 min read",
    excerpt:
      "What children eat directly affects their ability to concentrate, remember, and regulate their emotions in school.",
    coverGradient: "from-emerald-400 to-teal-600",
    content: [
      "The brain is a metabolically demanding organ — it uses approximately 20% of the body's total energy despite making up only 2% of its weight. For growing children, who are simultaneously building brain architecture and using it to learn, nutrition is not a peripheral concern but a central one.",
      "Breakfast is consistently linked to better academic performance. Children who eat breakfast show improved attention, memory, and problem-solving compared to those who don't. A breakfast that includes protein and complex carbohydrates — eggs, whole grain toast, yoghurt, oats — provides sustained energy rather than a spike and crash.",
      "Iron deficiency is one of the most common nutritional problems in young children worldwide, and its effects on cognitive development are significant. Iron is essential for myelination — the process that insulates nerve fibres and speeds up neural communication. Ensure children eat iron-rich foods: lentils, beans, dark leafy greens, eggs, and lean meat.",
      "Omega-3 fatty acids, particularly DHA, are critical for brain development and are found in fatty fish, walnuts, chia seeds, and flaxseeds. DHA makes up a substantial portion of the brain's grey matter and is associated with improved focus and reading ability.",
      "Sugar and ultra-processed foods impair learning not just through blood sugar swings but through their effects on the gut microbiome. Research increasingly links gut health to brain health — children with more diverse gut bacteria show better cognitive performance and emotional regulation. Variety, fibre, and fermented foods support this microbiome.",
      "Hydration is often overlooked. Even mild dehydration impairs concentration and working memory. Children should drink water throughout the day, not just when thirsty. Many children who struggle with focus in afternoon lessons are simply not drinking enough.",
      "Avoid restricting or labelling foods as 'bad' — this tends to increase their appeal and can seed unhealthy relationships with food. Instead, crowd in good nutrition: fruit available always, vegetables included in every meal, and protein at every snack. You decide what's offered; your child decides how much they eat.",
      "School lunchboxes don't need to be elaborate. A protein component, whole grain carbohydrate, fruit or vegetables, and water is the simple formula. Avoid lunchbox anxiety — a simple, nutritious box eaten willingly is far better than a Pinterest-worthy one that comes home untouched.",
    ],
  },
  {
    id: "7",
    title: "Creating a Learning-Friendly Home Environment",
    category: "Learning Activities",
    readTime: "6 min read",
    excerpt:
      "The physical and emotional atmosphere of your home is your child's first and most influential learning environment.",
    coverGradient: "from-blue-400 to-violet-600",
    content: [
      "Long before children enter a classroom, they are learning continuously — from the sounds they hear, the objects they touch, the conversations they observe, and the emotional atmosphere they inhabit. Your home is their first school, and you are their first teacher, whether you think of yourself that way or not.",
      "A print-rich environment supports literacy. This doesn't require educational posters — it means books accessible at child height, a chalkboard or whiteboard for mark-making, a visible shopping list on the fridge, labels on familiar objects if you wish, and an environment where children see adults reading and writing purposefully.",
      "Dedicate a space for making and creating. It doesn't need to be large — even a corner of the kitchen table set up with paper, crayons, scissors, and glue sends the message that creativity is valued. Keep materials accessible so children can create spontaneously rather than needing to ask permission.",
      "Embrace mess as a sign of learning. Sand, water, mud, paint, playdough, and loose parts might be annoying to clean up, but they're delivering sensory experiences that build neural connections in ways no screen or worksheet can replicate. A dedicated messy area — even an old sheet on the floor — makes it easier to say yes.",
      "Conversations are the richest learning tool in your home. Narrating what you're doing ('I'm checking if the water is boiling — it bubbles when it's very hot'), asking genuine questions ('Why do you think the plant is drooping?'), and thinking aloud ('Hmm, I'm not sure — let's find out together') are all forms of intellectual mentorship.",
      "Establish routines that protect time for learning play. After school: snack, outdoor play, free play, then reading before bed. Weekends: some outdoor time, some creative time, some family connection. Predictable structures reduce anxiety and free up cognitive energy for curiosity.",
      "Limit passive consumption time. Screens, especially passive video content, tend to crowd out the time and mental space needed for the active, engaged experiences that build real learning. This isn't about banning screens — it's about ensuring they don't become the default.",
      "Follow your child's interests obsessively. A child fascinated by insects should have books about insects, go on bug hunts, draw insects, watch documentaries about insects. Depth of engagement in any authentic interest builds the habits of mind — sustained attention, curiosity, and the desire to know more — that transfer to all learning.",
    ],
  },
  {
    id: "8",
    title: "Understanding Learning Styles: How Your Child Learns Best",
    category: "Early Childhood",
    readTime: "5 min read",
    excerpt:
      "Every child has preferences for how they take in and process new information. Understanding yours helps you support them better.",
    coverGradient: "from-amber-400 to-pink-500",
    content: [
      "While the idea of fixed 'learning styles' (visual, auditory, kinesthetic) has been complicated by neuroscience — most of us learn best through multi-sensory experiences — it remains true that children have preferences and strengths that shape how they engage with new information. Noticing your child's preferences helps you present learning in ways that feel natural to them.",
      "Some children are highly visual. They orient quickly to pictures, diagrams, charts, and spatial arrangements. They might draw while listening, organise their toys by colour or type, or remember things by picturing where they read them. These children benefit from mind maps, illustrated books, colour coding, and seeing a demonstration before being asked to do something themselves.",
      "Verbal and auditory learners thrive on language. They learn new words quickly, love stories and discussions, might talk through problems aloud, and often remember things by saying them out loud. These children benefit from explaining concepts back in their own words, reading aloud, audiobooks, and conversational exploration of ideas.",
      "Kinesthetic learners need to move and do. Abstract concepts only make sense when they can be touched, built, or acted out. These children learn multiplication by arranging objects into groups, understand geography by making a physical map, and remember a story better if they acted it out. They're often labelled 'difficult' in settings that require sitting still for long periods.",
      "Many children are social learners who think best in interaction with others. They process information through conversation, thrive in group projects, and often understand a concept better after explaining it to someone else. Paired reading, study groups, and family discussions at the dinner table are powerful for these children.",
      "Observe rather than categorise. Rather than deciding your child is 'a visual learner' and limiting their experience, notice what engages them deeply. When do they lean in? When do they get frustrated? What kinds of questions do they ask? These are clues about their current preferences, which will shift with age and experience.",
      "Offer multiple entry points for learning. When explaining how plants grow, use a book with pictures, a conversation, and then plant some seeds together. This multi-sensory approach works better than any single modality for most children, and ensures that children whose preferences differ all have a way in.",
      "Advocate for your child at school. If you notice your child struggles with purely worksheet-based homework but thrives when they can talk through or build something, share this with their teacher. Good teachers use this information. You are an expert on your child in ways that teachers, however excellent, cannot be from a classroom interaction alone.",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Parenting Tips",
  "Early Childhood",
  "Learning Activities",
  "School Readiness",
  "Child Development",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Parenting Tips": "bg-pink-100 text-pink-700",
  "Early Childhood": "bg-purple-100 text-purple-700",
  "Learning Activities": "bg-teal-100 text-teal-700",
  "School Readiness": "bg-yellow-100 text-yellow-800",
  "Child Development": "bg-green-100 text-green-700",
};

interface Props {
  user: AuthUser;
}

export default function ParentArticles({ user: _user }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered =
    selectedCategory === "All"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  if (selectedArticle) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-teal-600 hover:text-teal-700"
          onClick={() => setSelectedArticle(null)}
          data-ocid="articles.back_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Button>

        <div
          className={`h-40 rounded-xl bg-gradient-to-br ${selectedArticle.coverGradient} flex items-end p-6 mb-6`}
        >
          <div>
            <Badge
              className={`mb-2 ${CATEGORY_COLORS[selectedArticle.category] || "bg-gray-100 text-gray-700"}`}
            >
              {selectedArticle.category}
            </Badge>
            <h1 className="text-white text-2xl font-bold leading-tight">
              {selectedArticle.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Clock className="w-4 h-4" />
          <span>{selectedArticle.readTime}</span>
        </div>

        <div className="space-y-4">
          {selectedArticle.content.map((para, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is static
            <p key={i} className="text-gray-700 leading-relaxed text-base">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            className="text-teal-600 border-teal-300 hover:bg-teal-50"
            onClick={() => setSelectedArticle(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Learning Hub</h2>
        <p className="text-sm text-gray-500">
          Expert articles on parenting, child development, and learning
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6" data-ocid="articles.tab">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-teal-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        data-ocid="articles.list"
      >
        {filtered.map((article, idx) => (
          <div
            key={article.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            data-ocid={`articles.item.${idx + 1}`}
          >
            <div
              className={`h-28 bg-gradient-to-br ${article.coverGradient} flex items-center justify-center`}
            >
              <BookOpen className="w-10 h-10 text-white/70" />
            </div>
            <div className="p-4">
              <Badge
                className={`mb-2 text-xs ${CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-700"}`}
              >
                {article.category}
              </Badge>
              <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
                <Button
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600 text-white text-xs h-7 px-3"
                  onClick={() => setSelectedArticle(article)}
                  data-ocid={`articles.primary_button.${idx + 1}`}
                >
                  Read Article
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-12 text-gray-400"
          data-ocid="articles.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
}
