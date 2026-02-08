import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Title {
  id: string;
  name: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface User {
  username: string;
  balance: number;
  ownedTitles: string[];
  activeTitle: string | null;
  timeSpent: number;
  isAdmin: boolean;
}

const TITLES: Title[] = [
  { id: '1', name: '⚔️ Новичок', price: 0, rarity: 'common', description: 'Начальный титул для всех игроков' },
  { id: '2', name: '🔥 Воин', price: 100, rarity: 'common', description: 'Путь воина начинается здесь' },
  { id: '3', name: '⚡ Громовержец', price: 500, rarity: 'rare', description: 'Повелитель молний' },
  { id: '4', name: '🌟 Легенда', price: 1000, rarity: 'epic', description: 'Легендарный статус' },
  { id: '5', name: '👑 Король Киберпанка', price: 5000, rarity: 'legendary', description: 'Абсолютная власть в цифровом мире' },
  { id: '6', name: '💎 Коллекционер', price: 750, rarity: 'rare', description: 'Собиратель редкостей' },
  { id: '7', name: '🎯 Снайпер', price: 300, rarity: 'common', description: 'Точность превыше всего' },
  { id: '8', name: '🚀 Киберпилот', price: 2000, rarity: 'epic', description: 'Покоритель цифровых просторов' },
];

const rarityColors = {
  common: 'text-gray-400 border-gray-600',
  rare: 'text-blue-400 border-blue-600 neon-glow',
  epic: 'text-purple-400 border-purple-600 neon-glow-purple',
  legendary: 'text-yellow-400 border-yellow-600',
};

export default function Index() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [user, setUser] = useState<User>({
    username: '',
    balance: 0,
    ownedTitles: ['1'],
    activeTitle: '1',
    timeSpent: 0,
    isAdmin: false,
  });

  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'q1',
      name: 'Первые шаги',
      description: 'Проведите 1 минуту на сайте',
      reward: 50,
      progress: 0,
      target: 60,
      completed: false,
    },
    {
      id: 'q2',
      name: 'Путь воина',
      description: 'Проведите 5 минут на сайте',
      reward: 200,
      progress: 0,
      target: 300,
      completed: false,
    },
    {
      id: 'q3',
      name: 'Мастер времени',
      description: 'Проведите 15 минут на сайте',
      reward: 1000,
      progress: 0,
      target: 900,
      completed: false,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Система', message: 'Добро пожаловать в чат!', timestamp: new Date() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminCoinAmount, setAdminCoinAmount] = useState('');

  // Time tracking
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setUser(prev => {
        const newTimeSpent = prev.timeSpent + 1;
        return { ...prev, timeSpent: newTimeSpent };
      });

      setQuests(prev => prev.map(quest => {
        if (quest.completed) return quest;
        const newProgress = Math.min(quest.progress + 1, quest.target);
        const isCompleted = newProgress >= quest.target;
        
        if (isCompleted && !quest.completed) {
          setUser(u => ({ ...u, balance: u.balance + quest.reward }));
          toast({
            title: '🎉 Задание выполнено!',
            description: `Получено ${quest.reward} ТитулКоинов за "${quest.name}"`,
          });
        }

        return { ...quest, progress: newProgress, completed: isCompleted };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, toast]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleAuth = () => {
    if (!username || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');

    if (authMode === 'register') {
      if (savedUsers[username]) {
        toast({
          title: 'Ошибка',
          description: 'Пользователь уже существует',
          variant: 'destructive',
        });
        return;
      }

      const newUser: User = {
        username,
        balance: 100,
        ownedTitles: ['1'],
        activeTitle: '1',
        timeSpent: 0,
        isAdmin: username === 'admin',
      };

      savedUsers[username] = { password, ...newUser };
      localStorage.setItem('users', JSON.stringify(savedUsers));
      
      setUser(newUser);
      setIsLoggedIn(true);
      setShowAuthDialog(false);
      
      toast({
        title: '✨ Добро пожаловать!',
        description: `Аккаунт ${username} создан. Получено 100 стартовых ТитулКоинов!`,
      });
    } else {
      const savedUser = savedUsers[username];
      if (!savedUser || savedUser.password !== password) {
        toast({
          title: 'Ошибка',
          description: 'Неверное имя пользователя или пароль',
          variant: 'destructive',
        });
        return;
      }

      setUser(savedUser);
      setIsLoggedIn(true);
      setShowAuthDialog(false);
      
      toast({
        title: '👋 С возвращением!',
        description: `Рады видеть тебя, ${username}!`,
      });
    }

    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    savedUsers[user.username] = { password: savedUsers[user.username].password, ...user };
    localStorage.setItem('users', JSON.stringify(savedUsers));

    setIsLoggedIn(false);
    setUser({
      username: '',
      balance: 0,
      ownedTitles: ['1'],
      activeTitle: '1',
      timeSpent: 0,
      isAdmin: false,
    });

    toast({
      title: 'Выход',
      description: 'До скорых встреч!',
    });
  };

  const handleTitleClick = (title: Title) => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы покупать титулы',
        variant: 'destructive',
      });
      return;
    }

    if (user.ownedTitles.includes(title.id)) {
      setUser(prev => ({ ...prev, activeTitle: title.id }));
      toast({
        title: '✅ Титул активирован',
        description: `Теперь ваш титул: ${title.name}`,
      });
    } else {
      setSelectedTitle(title);
      setShowPurchaseDialog(true);
    }
  };

  const handlePurchase = () => {
    if (!selectedTitle) return;

    if (user.balance < selectedTitle.price) {
      toast({
        title: 'Недостаточно средств',
        description: `Нужно еще ${selectedTitle.price - user.balance} ТитулКоинов`,
        variant: 'destructive',
      });
      return;
    }

    setUser(prev => ({
      ...prev,
      balance: prev.balance - selectedTitle.price,
      ownedTitles: [...prev.ownedTitles, selectedTitle.id],
      activeTitle: selectedTitle.id,
    }));

    toast({
      title: '🎊 Покупка завершена!',
      description: `Титул "${selectedTitle.name}" теперь ваш!`,
    });

    setShowPurchaseDialog(false);
    setSelectedTitle(null);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы писать в чат',
        variant: 'destructive',
      });
      return;
    }

    const activeTitle = TITLES.find(t => t.id === user.activeTitle);
    const displayName = activeTitle ? `${activeTitle.name} ${user.username}` : user.username;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: displayName,
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleAdminGiveCoins = () => {
    const amount = parseInt(adminCoinAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректное количество',
        variant: 'destructive',
      });
      return;
    }

    setUser(prev => ({ ...prev, balance: prev.balance + amount }));
    toast({
      title: '💰 Монеты начислены',
      description: `Добавлено ${amount} ТитулКоинов`,
    });
    setAdminCoinAmount('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}м ${secs}с`;
  };

  const copyTitle = (titleName: string, titleId: string) => {
    if (!user.ownedTitles.includes(titleId)) {
      toast({
        title: '🔒 Титул заблокирован',
        description: 'Купите титул, чтобы скопировать его',
        variant: 'destructive',
      });
      return;
    }

    navigator.clipboard.writeText(titleName);
    toast({
      title: '📋 Скопировано',
      description: `Титул "${titleName}" скопирован в буфер обмена`,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen dark bg-background cyber-grid flex items-center justify-center p-4">
        <Card className="w-full max-w-md neon-border">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold neon-glow mb-2">
              🎮 CYBERVERSE
            </CardTitle>
            <CardDescription className="text-lg">
              Платформа титулов и достижений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                placeholder="Введите имя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <Button onClick={handleAuth} className="w-full neon-border">
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full"
            >
              {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark bg-background cyber-grid">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold neon-glow">🎮 CYBERVERSE</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg neon-border">
              <Icon name="Coins" className="text-primary" />
              <span className="font-bold text-xl text-primary neon-glow">{user.balance}</span>
              <span className="text-sm text-muted-foreground">ТитулКоин</span>
            </div>
            {user.isAdmin && (
              <Button onClick={() => setShowAdminPanel(!showAdminPanel)} variant="outline" size="sm">
                <Icon name="Shield" className="mr-2" />
                Админ
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <Icon name="LogOut" className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Panel */}
        {user.isAdmin && showAdminPanel && (
          <Card className="mb-8 neon-border-purple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Shield" className="text-secondary" />
                Панель администратора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Статус: Только вы онлайн</Label>
                <Badge variant="outline" className="ml-2">
                  <Icon name="Users" className="mr-1 h-3 w-3" />1 пользователь
                </Badge>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Количество монет"
                  value={adminCoinAmount}
                  onChange={(e) => setAdminCoinAmount(e.target.value)}
                />
                <Button onClick={handleAdminGiveCoins}>
                  Выдать себе
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="titles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="titles">Титулы</TabsTrigger>
            <TabsTrigger value="quests">Задания</TabsTrigger>
            <TabsTrigger value="chat">Чат</TabsTrigger>
          </TabsList>

          {/* Titles Tab */}
          <TabsContent value="titles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" className="text-primary" />
                  Ваш активный титул
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.activeTitle && (
                  <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border-2 border-primary neon-border">
                    <span className="text-2xl font-bold">
                      {TITLES.find(t => t.id === user.activeTitle)?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const title = TITLES.find(t => t.id === user.activeTitle);
                        if (title) copyTitle(title.name, title.id);
                      }}
                    >
                      <Icon name="Copy" className="mr-2 h-4 w-4" />
                      Копировать
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TITLES.map(title => {
                const owned = user.ownedTitles.includes(title.id);
                const active = user.activeTitle === title.id;

                return (
                  <Card
                    key={title.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      rarityColors[title.rarity]
                    } ${active ? 'ring-2 ring-primary' : ''} border-2`}
                    onClick={() => handleTitleClick(title)}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center justify-between">
                        <span>{title.name}</span>
                        {owned && <Icon name="Check" className="text-green-500" />}
                      </CardTitle>
                      <CardDescription>{title.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {owned ? (
                          <Badge variant={active ? 'default' : 'secondary'}>
                            {active ? 'Активен' : 'В коллекции'}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Icon name="Coins" className="text-primary" />
                            <span className="font-bold text-primary">{title.price}</span>
                          </div>
                        )}
                        <Badge variant="outline">{title.rarity}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Target" className="text-secondary" />
                  Ваш прогресс
                </CardTitle>
                <CardDescription>
                  Время на сайте: {formatTime(user.timeSpent)}
                </CardDescription>
              </CardHeader>
            </Card>

            {quests.map(quest => (
              <Card key={quest.id} className={quest.completed ? 'opacity-60' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{quest.name}</span>
                    {quest.completed && <Icon name="CheckCircle2" className="text-green-500" />}
                  </CardTitle>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={(quest.progress / quest.target) * 100} className="h-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatTime(quest.progress)} / {formatTime(quest.target)}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Icon name="Coins" className="h-4 w-4" />
                      <span>+{quest.reward}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" className="text-primary" />
                  Глобальный чат
                </CardTitle>
                <CardDescription>Общайтесь с другими игроками</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4" ref={chatScrollRef}>
                  <div className="space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-card/50 rounded-lg p-3 border border-border">
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Введите сообщение..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Icon name="Send" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение покупки</DialogTitle>
            <DialogDescription>
              Вы хотите приобрести этот титул?
            </DialogDescription>
          </DialogHeader>
          {selectedTitle && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-card/50 rounded-lg border-2 border-primary">
                <div className="text-3xl font-bold mb-2">{selectedTitle.name}</div>
                <div className="text-muted-foreground mb-4">{selectedTitle.description}</div>
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                  <Icon name="Coins" />
                  <span>{selectedTitle.price}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Ваш баланс:</span>
                <span className="font-bold">{user.balance} ТитулКоинов</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>После покупки:</span>
                <span className={`font-bold ${user.balance - selectedTitle.price < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {user.balance - selectedTitle.price} ТитулКоинов
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handlePurchase} disabled={!selectedTitle || user.balance < selectedTitle.price}>
              Купить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
