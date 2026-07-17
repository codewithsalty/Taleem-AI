
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveContainer, LineChart, RadarChart, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Line, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import { Award, BookOpen, Clock, Target, MessageSquare, Download, Calendar, Flame, TrendingUp, Book, Star, TrendingDown, Phone, Bell, BadgeCheck, History } from 'lucide-react';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";


const recentAchievements = [
    { name: "Science Whiz", icon: BookOpen },
    { name: "Quiz Master", icon: Target },
    { name: "Hot Streak", icon: Flame },
];

const weakAreasData = [
    { topic: "Fractions", subject: "Math Grade 3", accuracy: 55 },
    { topic: "The Mughal Empire", subject: "History Grade 5", accuracy: 62 },
    { topic: "Sentence Structure", subject: "English Grade 4", accuracy: 68 },
];

const HeatmapCalendar = () => {
    const today = new Date();
    const daysInPast = 365;
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate day data
    const days = Array.from({ length: daysInPast }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const activityLevel = Math.floor(Math.random() * 5); // 0-4
        return { date, activityLevel };
    }).reverse();

    const levels = ['bg-muted/30', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'];
    
    // Create month markers
    const monthMarkers = days
        .map((day, index) => {
            const weekIndex = Math.floor(index / 7);
            if (day.date.getDate() === 1) {
                return { month: monthLabels[day.date.getMonth()], week: weekIndex };
            }
            return null;
        })
        .filter(Boolean);

    return (
        <TooltipProvider>
            <div className="flex gap-2 text-xs text-muted-foreground">
                <div className="flex flex-col-reverse justify-between py-2">
                    {dayLabels.map((day, i) => ( i % 2 !== 0 && <div key={day}>{day}</div> ))}
                </div>
                <div className="relative flex-grow">
                    <div className="absolute top-0 left-0 flex" style={{marginLeft: '1rem'}}>
                        {monthMarkers.map((marker, index) => (
                            <div key={index} className="text-center" style={{ position: 'absolute', left: `${marker!.week * 1.25}rem`, minWidth: '3rem' }}>
                                {marker!.month}
                            </div>
                        ))}
                    </div>
                     <div className="grid grid-flow-col grid-rows-7 gap-1 pt-6">
                        {days.map(({ date, activityLevel }, i) => (
                            <UiTooltip key={i}>
                                <TooltipTrigger asChild>
                                    <div 
                                        className={`w-4 h-4 rounded-sm ${levels[activityLevel]}`} 
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{date.toLocaleDateString()}: {activityLevel > 0 ? `${Math.round(activityLevel * 25)} mins` : 'No activity'}</p>
                                </TooltipContent>
                            </UiTooltip>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};


export default function ParentDashboardPage() {
    const { user, isUserLoading } = useUser();
    const [notifications, setNotifications] = useState({
        weeklySummary: true,
        achievement: true,
        streak: true,
        goalCompleted: true,
    });

    const handleNotificationChange = (type: keyof typeof notifications, value: boolean) => {
        setNotifications(prev => ({ ...prev, [type]: value }));
    }

    // Mock data until we connect to firestore
    const dailyStudyData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        minutes: Math.round(30 + Math.random() * 90),
    }));

    const subjectPerformanceData = [
        { subject: 'Math', score: 85, fullMark: 100 },
        { subject: 'Science', score: 92, fullMark: 100 },
        { subject: 'English', score: 78, fullMark: 100 },
        { subject: 'Urdu', score: 88, fullMark: 100 },
        { subject: 'History', score: 72, fullMark: 100 },
    ];
    
    const quizAccuracyData = [
        { name: 'Jan', Math: 75, Science: 80, English: 65, Urdu: 85 },
        { name: 'Feb', Math: 78, Science: 82, English: 70, Urdu: 88 },
        { name: 'Mar', Math: 82, Science: 85, English: 75, Urdu: 90 },
        { name: 'Apr', Math: 80, Science: 88, English: 78, Urdu: 92 },
        { name: 'May', Math: 85, Science: 90, English: 80, Urdu: 94 },
        { name: 'Jun', Math: 88, Science: 92, English: 85, Urdu: 95 },
    ];
    
    const overviewStats = [
        { title: "Weekly Study Time", value: "8.5 Hours", icon: Clock },
        { title: "Sessions This Week", value: "12", icon: Book },
        { title: "Current Level", value: user ? `${user.levelTitle} (Lvl ${user.level})` : 'N/A', icon: Award },
        { title: "Total Points", value: user?.points ?? 'N/A', icon: Star },
    ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
          <header className="flex justify-between items-center mb-8">
              <div>
                  <h1 className="text-3xl font-bold font-headline">Parent Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, Mr. Ahmed!</p>
              </div>
              <div className="flex items-center gap-4">
                   <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/parent/100/100" data-ai-hint="person portrait" />
                      <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Log Out</Button>
              </div>
          </header>

          <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline mb-4">Ali's Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isUserLoading ? (
                      Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28" />)
                  ) : (
                      overviewStats.map(stat => {
                          const Icon = stat.icon;
                          return (
                              <Card key={stat.title}>
                                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                      <Icon className="h-4 w-4 text-muted-foreground" />
                                  </CardHeader>
                                  <CardContent>
                                      <div className="text-2xl font-bold">{stat.value}</div>
                                  </CardContent>
                              </Card>
                          );
                      })
                  )}
              </div>
          </div>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                   <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Award className="text-primary" /> Recent Achievements</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-around items-center">
                          {recentAchievements.map(ach => {
                              const Icon = ach.icon;
                              return (
                                  <UiTooltip key={ach.name}>
                                      <TooltipTrigger>
                                          <div className="flex flex-col items-center gap-2">
                                              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary/50">
                                                  <Icon className="w-8 h-8 text-primary" />
                                              </div>
                                              <p className="text-xs font-medium text-muted-foreground">{ach.name}</p>
                                          </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>Unlocked: {ach.name}</p>
                                      </TooltipContent>
                                  </UiTooltip>
                              )
                          })}
                      </CardContent>
                  </Card>

                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Clock className="text-primary" /> Daily Study Time (Last 30 Days)</CardTitle>
                          <CardDescription>Total minutes of learning activity per day.</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                          {isUserLoading ? <Skeleton className="h-full w-full" /> : (
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={dailyStudyData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)"/>
                                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                                      <YAxis unit="m" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                                      <Tooltip 
                                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                          labelStyle={{ fontWeight: 'bold' }}
                                          formatter={(value: number) => [`${value} mins`, "Study Time"]}
                                      />
                                      <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                                  </LineChart>
                              </ResponsiveContainer>
                          )}
                      </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Card className="shadow-md">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-secondary" /> Subject Performance</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[300px]">
                               {isUserLoading ? <Skeleton className="h-full w-full" /> : (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformanceData}>
                                          <defs>
                                              <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4}/>
                                                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                                              </linearGradient>
                                          </defs>
                                          <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                                          <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} />
                                          <Radar isAnimationActive={true} animationEasing="ease-out" name="Performance" dataKey="score" stroke="hsl(var(--secondary))" fill="url(#colorRadar)" fillOpacity={0.8} />
                                          <Tooltip
                                              contentStyle={{
                                                  backgroundColor: "hsl(var(--background))",
                                                  borderColor: "hsl(var(--border))",
                                                  borderRadius: "var(--radius)",
                                              }}
                                              labelStyle={{
                                                  fontWeight: "bold",
                                                  color: "hsl(var(--foreground))"
                                              }}
                                          />
                                      </RadarChart>
                                  </ResponsiveContainer>
                               )}
                          </CardContent>
                      </Card>
                       <Card className="shadow-md">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 font-headline"><TrendingUp className="text-accent" /> Quiz Accuracy Trends</CardTitle>
                              <CardDescription>Performance over the last 6 months.</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[300px]">
                               {isUserLoading ? <Skeleton className="h-full w-full" /> : (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={quizAccuracyData}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                                          <Tooltip
                                              contentStyle={{
                                                  backgroundColor: "hsl(var(--background))",
                                                  borderColor: "hsl(var(--border))",
                                                  borderRadius: "var(--radius)",
                                              }}
                                          />
                                          <Legend wrapperStyle={{fontSize: "14px"}}/>
                                          <Line type="monotone" dataKey="Math" stroke="hsl(var(--primary))" strokeWidth={2} />
                                          <Line type="monotone" dataKey="Science" stroke="hsl(var(--secondary))" strokeWidth={2} />
                                          <Line type="monotone" dataKey="English" stroke="hsl(var(--accent))" strokeWidth={2} />
                                          <Line type="monotone" dataKey="Urdu" stroke="#f97316" strokeWidth={2} />
                                      </LineChart>
                                  </ResponsiveContainer>
                               )}
                          </CardContent>
                      </Card>
                  </div>

                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Calendar className="text-blue-500" /> Learning Activity (Last Year)</CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-x-auto pb-4">
                          <HeatmapCalendar />
                      </CardContent>
                  </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Target className="text-green-500"/> Weekly Progress</CardTitle>
                          <CardDescription>Progress towards the goals you've set.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                              <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Study Time</span>
                                  <span className="text-sm text-muted-foreground">3 / 5 hours</span>
                              </div>
                              <Progress value={60} />
                          </div>
                          <div>
                              <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Quizzes Completed</span>
                                  <span className="text-sm text-muted-foreground">8 / 10 quizzes</span>
                              </div>
                              <Progress value={80} />
                          </div>
                          <div className="pt-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><TrendingDown className="text-destructive"/> Areas for Focus</h4>
                               <div className="space-y-3">
                                  {weakAreasData.map((area, index) => (
                                      <div key={index} className="flex items-center p-2 -m-2 rounded-lg hover:bg-muted/50">
                                          <div className="flex-grow">
                                              <p className="font-semibold text-sm">{area.topic}</p>
                                              <p className="text-xs text-muted-foreground">{area.subject}</p>
                                          </div>
                                          <div className="font-bold text-sm text-destructive">{area.accuracy}%</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Target className="text-destructive"/> Set Weekly Goals</CardTitle>
                          <CardDescription>Set learning targets for your child.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="study-hours">Weekly Study Goal (Hours)</Label>
                              <Input id="study-hours" type="number" placeholder="e.g., 5" defaultValue="5" />
                          </div>
                           <div className="space-y-2">
                              <Label htmlFor="quizzes">Weekly Quiz Goal</Label>
                              <Input id="quizzes" type="number" placeholder="e.g., 10" defaultValue="10" />
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Set Goals</Button>
                      </CardFooter>
                  </Card>
                   <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Phone className="text-blue-500"/> SMS Notification Settings</CardTitle>
                          <CardDescription>Enter your phone number to receive SMS alerts.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="space-y-2">
                              <Label htmlFor="phone-number">Phone Number</Label>
                              <Input id="phone-number" type="tel" placeholder="+92 300 1234567" />
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full">Save Phone Number</Button>
                      </CardFooter>
                  </Card>

                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Bell className="text-amber-500"/> Notification Preferences</CardTitle>
                          <CardDescription>Control which SMS alerts you receive.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                              <Label htmlFor="weekly-summary" className="flex items-center gap-2"><Calendar className="text-muted-foreground"/> Weekly Summary</Label>
                              <Switch id="weekly-summary" checked={notifications.weeklySummary} onCheckedChange={(val) => handleNotificationChange('weeklySummary', val)} />
                          </div>
                          <div className="flex items-center justify-between">
                              <Label htmlFor="achievement-unlocked" className="flex items-center gap-2"><Award className="text-muted-foreground"/> Achievement Unlocked</Label>
                              <Switch id="achievement-unlocked" checked={notifications.achievement} onCheckedChange={(val) => handleNotificationChange('achievement', val)} />
                          </div>
                          <div className="flex items-center justify-between">
                              <Label htmlFor="streak-reminder" className="flex items-center gap-2"><History className="text-muted-foreground"/> Streak Reminder</Label>
                              <Switch id="streak-reminder" checked={notifications.streak} onCheckedChange={(val) => handleNotificationChange('streak', val)} />
                          </div>
                          <div className="flex items-center justify-between">
                              <Label htmlFor="goal-completed" className="flex items-center gap-2"><BadgeCheck className="text-muted-foreground"/> Goal Completed</Label>
                              <Switch id="goal-completed" checked={notifications.goalCompleted} onCheckedChange={(val) => handleNotificationChange('goalCompleted', val)} />
                          </div>
                      </CardContent>
                  </Card>

                   <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><MessageSquare className="text-indigo-500"/> Send Encouragement</CardTitle>
                          <CardDescription>Send a supportive message to your child's dashboard.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Input placeholder="e.g., 'Keep up the great work!'" />
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">Send Message</Button>
                      </CardFooter>
                  </Card>
                   <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-headline"><Download className="text-muted-foreground"/> Reports</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Button variant="outline" className="w-full">Download Monthly Report (PDF)</Button>
                      </CardContent>
                  </Card>
              </div>
          </main>
      </div>
    </TooltipProvider>
  );
}
