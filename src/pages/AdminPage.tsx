import { motion } from "framer-motion";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  Bell, 
  Search,
  ArrowUpRight,
  MoreVertical,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const stats = [
  { label: "Total Students", value: "2.4k", icon: Users, change: "+12%", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Active Sessions", value: "156", icon: Activity, change: "+5%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Avg. Score", value: "84%", icon: BarChart3, change: "+2%", color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Storage Used", value: "1.2 TB", icon: Layers, change: "+18%", color: "text-pink-500", bg: "bg-pink-500/10" },
];

const students = [
  { id: 1, name: "Alex Johnson", email: "alex.j@example.com", status: "Active", progress: "88%", lastActive: "2m ago" },
  { id: 2, name: "Sarah Miller", email: "sarah.m@example.com", status: "Away", progress: "92%", lastActive: "15m ago" },
  { id: 3, name: "James Wilson", email: "j.wilson@example.com", status: "Inactive", progress: "45%", lastActive: "2d ago" },
  { id: 4, name: "Emma Davis", email: "emma.d@example.com", status: "Active", progress: "76%", lastActive: "1h ago" },
];

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage users, content, and system performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9 bg-card border-border/50 focus:ring-primary/20" />
            </div>
            <Button variant="outline" size="icon" className="border-border/50">
              <Bell className="h-4 w-4" />
            </Button>
            <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
              <ShieldCheck className="h-4 w-4" />
              System Status
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                      {stat.change}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Table */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Students</CardTitle>
                  <CardDescription>Overview of student activity and progress.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        <th className="pb-4 pt-0">Student</th>
                        <th className="pb-4 pt-0">Status</th>
                        <th className="pb-4 pt-0">Progress</th>
                        <th className="pb-4 pt-0">Last Active</th>
                        <th className="pb-4 pt-0 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-border/30 last:border-0 group hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <div>
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                              student.status === 'Away' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-rose-500/10 text-rose-500'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: student.progress }} />
                              </div>
                              <span className="text-xs font-semibold">{student.progress}</span>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">{student.lastActive}</td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Settings */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all group">
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Add New Student
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 hover:bg-accent/5 hover:border-accent/30 transition-all group">
                  <div className="p-1.5 rounded-lg bg-accent/10 group-hover:bg-accent/20">
                    <Layers className="h-4 w-4 text-accent" />
                  </div>
                  Batch Content Upload
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 hover:bg-pink-500/5 hover:border-pink-500/30 transition-all group">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20">
                    <Settings className="h-4 w-4 text-pink-500" />
                  </div>
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="h-20 w-20" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Security Audit</CardTitle>
                <CardDescription className="text-foreground/70">Your system is up to date and secure.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full font-semibold">Run Deep Scan</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
