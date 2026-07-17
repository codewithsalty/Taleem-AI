
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, Package, Trash2, Loader2, List, Wifi } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const subjects = ['Math', 'Science', 'English', 'Urdu', 'Social Studies'];
const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

type DownloadItem = {
  id: string;
  subject: string;
  grade: string;
  size: number; // in MB
  progress: number;
};

export default function OfflineManagerPage() {
  const [downloadedItems, setDownloadedItems] = useState<DownloadItem[]>([
    { id: 'math-5', subject: 'Math', grade: 'Grade 5', size: 85, progress: 100 },
    { id: 'sci-4', subject: 'Science', grade: 'Grade 4', size: 62, progress: 100 },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const newDownload: DownloadItem = {
        id: 'eng-3',
        subject: 'English',
        grade: 'Grade 3',
        size: 45,
        progress: 0,
    };
    
    const itemExists = downloadedItems.some(item => item.id === newDownload.id);

    if (!itemExists) {
        setDownloadedItems(prev => [...prev, newDownload]);
        const interval = setInterval(() => {
            setDownloadedItems(currentItems =>
                currentItems.map(item => {
                    if (item.id === newDownload.id && item.progress < 100) {
                        const newProgress = Math.min(item.progress + Math.random() * 20, 100);
                        return { ...item, progress: newProgress };
                    }
                    return item;
                })
            );
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
            setDownloadedItems(currentItems =>
                currentItems.map(item =>
                    item.id === newDownload.id ? { ...item, progress: 100 } : item
                )
            );
        }, 4000);
    }
  }, []);

  const totalSize = downloadedItems.reduce((acc, item) => acc + item.size, 0);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
    }, 3000);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Offline Mode Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Download className="w-5 h-5" /> Download Content
              </CardTitle>
              <CardDescription>
                Select a subject and grade to download for offline use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Grade</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Download Curriculum</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Wifi className="w-5 h-5" /> Sync Status
                </CardTitle>
                 <CardDescription>
                    Manually sync your progress with the cloud.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Last synced: 5 minutes ago</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSync} disabled={isSyncing}>
                    {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <List className="w-5 h-5" /> Downloaded Content
              </CardTitle>
              <CardDescription>
                Manage content stored on your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {downloadedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="p-3 bg-primary/10 rounded-md">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.subject} - {item.grade}</p>
                          <p className="text-sm text-muted-foreground">{item.size} MB</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Progress value={item.progress} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start pt-4 border-t">
                <h3 className="font-semibold">Storage Usage</h3>
                <div className="w-full flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Used: {totalSize.toFixed(2)} MB</span>
                    <span>Available: 2.5 GB</span>
                </div>
                <Progress value={(totalSize / 2500) * 100} className="w-full mt-2 h-2" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
