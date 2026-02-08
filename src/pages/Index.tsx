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
  type?: 'time' | 'chat' | 'purchase' | 'balance';
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
  messageCount: number;
}

const TITLES: Title[] = [
  { id: '1', name: '[NEWBIE]', price: 0, rarity: 'common', description: 'Starting title for all players' },
  { id: '2', name: '[VIP]', price: 500, rarity: 'rare', description: 'Very Important Player status' },
  { id: '3', name: '[ADMIN]', price: 2000, rarity: 'epic', description: 'Administrator authority' },
  { id: '4', name: '[SNIPER]', price: 800, rarity: 'rare', description: 'Precision and accuracy' },
  { id: '5', name: '[LEGEND]', price: 3000, rarity: 'epic', description: 'Legendary warrior status' },
  { id: '6', name: '[KING]', price: 10000, rarity: 'legendary', description: 'Ultimate royal power' },
  { id: '7', name: '[TASK-MASTER]', price: 1500, rarity: 'epic', description: 'Master of all quests' },
  { id: '8', name: '[CHEATER]', price: 5000, rarity: 'legendary', description: 'Breaking all the rules' },
  { id: '9', name: '[CREATOR]', price: 4000, rarity: 'epic', description: 'Content creator elite' },
  { id: '10', name: '[COLLAB]', price: 1200, rarity: 'rare', description: 'Collaboration specialist' },
  { id: '11', name: '[SAF ADMIN]', price: 7500, rarity: 'legendary', description: 'SAF Administration' },
  { id: '12', name: '[SAT ADMIN]', price: 8000, rarity: 'legendary', description: 'SAT Administration' },
  { id: '13', name: '[TROLLER]', price: 2500, rarity: 'epic', description: 'Master of trolling' },
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
    messageCount: 0,
  });

  const [quests, setQuests] = useState<Quest[]>([
    { id: 'q1', name: 'Первые шаги', description: 'Проведите 30 секунд на сайте', reward: 25, progress: 0, target: 30, completed: false, type: 'time' },
    { id: 'q2', name: 'Новичок', description: 'Проведите 1 минуту на сайте', reward: 50, progress: 0, target: 60, completed: false, type: 'time' },
    { id: 'q3', name: 'Исследователь', description: 'Проведите 2 минуты на сайте', reward: 75, progress: 0, target: 120, completed: false, type: 'time' },
    { id: 'q4', name: 'Активный игрок', description: 'Проведите 3 минуты на сайте', reward: 100, progress: 0, target: 180, completed: false, type: 'time' },
    { id: 'q5', name: 'Ветеран', description: 'Проведите 5 минут на сайте', reward: 200, progress: 0, target: 300, completed: false, type: 'time' },
    { id: 'q6', name: 'Постоянный гость', description: 'Проведите 7 минут на сайте', reward: 300, progress: 0, target: 420, completed: false, type: 'time' },
    { id: 'q7', name: 'Преданный', description: 'Проведите 10 минут на сайте', reward: 500, progress: 0, target: 600, completed: false, type: 'time' },
    { id: 'q8', name: 'Мастер времени', description: 'Проведите 15 минут на сайте', reward: 1000, progress: 0, target: 900, completed: false, type: 'time' },
    { id: 'q9', name: 'Покоритель', description: 'Проведите 20 минут на сайте', reward: 1500, progress: 0, target: 1200, completed: false, type: 'time' },
    { id: 'q10', name: 'Легенда', description: 'Проведите 30 минут на сайте', reward: 2500, progress: 0, target: 1800, completed: false, type: 'time' },
    { id: 'q11', name: 'Титан', description: 'Проведите 45 минут на сайте', reward: 4000, progress: 0, target: 2700, completed: false, type: 'time' },
    { id: 'q12', name: 'Бог времени', description: 'Проведите 1 час на сайте', reward: 6000, progress: 0, target: 3600, completed: false, type: 'time' },
    { id: 'q13', name: 'Чемпион', description: 'Проведите 1.5 часа на сайте', reward: 8000, progress: 0, target: 5400, completed: false, type: 'time' },
    { id: 'q14', name: 'Несокрушимый', description: 'Проведите 2 часа на сайте', reward: 10000, progress: 0, target: 7200, completed: false, type: 'time' },
    { id: 'q15', name: 'Король времени', description: 'Проведите 3 часа на сайте', reward: 15000, progress: 0, target: 10800, completed: false, type: 'time' },
    { id: 'q16', name: 'Болтун', description: 'Отправьте 5 сообщений в чат', reward: 100, progress: 0, target: 5, completed: false, type: 'chat' },
    { id: 'q17', name: 'Общительный', description: 'Отправьте 10 сообщений в чат', reward: 200, progress: 0, target: 10, completed: false, type: 'chat' },
    { id: 'q18', name: 'Говорун', description: 'Отправьте 25 сообщений в чат', reward: 500, progress: 0, target: 25, completed: false, type: 'chat' },
    { id: 'q19', name: 'Спамер', description: 'Отправьте 50 сообщений в чат', reward: 1000, progress: 0, target: 50, completed: false, type: 'chat' },
    { id: 'q20', name: 'Чат-монстр', description: 'Отправьте 100 сообщений в чат', reward: 2000, progress: 0, target: 100, completed: false, type: 'chat' },
    { id: 'q21', name: 'Коллекционер', description: 'Купите 3 титула', reward: 500, progress: 0, target: 3, completed: false, type: 'purchase' },
    { id: 'q22', name: 'Собиратель', description: 'Купите 5 титулов', reward: 1000, progress: 0, target: 5, completed: false, type: 'purchase' },
    { id: 'q23', name: 'Охотник за титулами', description: 'Купите 8 титулов', reward: 2000, progress: 0, target: 8, completed: false, type: 'purchase' },
    { id: 'q24', name: 'Владелец всего', description: 'Купите все титулы', reward: 5000, progress: 0, target: 13, completed: false, type: 'purchase' },
    { id: 'q25', name: 'Богач', description: 'Накопите 5000 ТитулКоинов', reward: 500, progress: 0, target: 5000, completed: false, type: 'balance' },
    { id: 'q26', name: 'Миллионер', description: 'Накопите 10000 ТитулКоинов', reward: 1000, progress: 0, target: 10000, completed: false, type: 'balance' },
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
        if (quest.completed || quest.type !== 'time') return quest;
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

  // Balance quest tracking
  useEffect(() => {
    if (!isLoggedIn) return;

    setQuests(prev => prev.map(quest => {
      if (quest.completed || quest.type !== 'balance') return quest;
      const newProgress = user.balance;
      const isCompleted = newProgress >= quest.target;
      
      if (isCompleted && !quest.completed) {
        toast({
          title: '🎉 Задание выполнено!',
          description: `Получено ${quest.reward} ТитулКоинов за "${quest.name}"`,
        });
        setTimeout(() => {
          setUser(u => ({ ...u, balance: u.balance + quest.reward }));
        }, 100);
      }

      return { ...quest, progress: newProgress, completed: isCompleted };
    }));
  }, [user.balance, isLoggedIn, toast]);

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
        messageCount: 0,
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

      setUser({ ...savedUser, messageCount: savedUser.messageCount || 0 });
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
      messageCount: 0,
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

    setQuests(prev => prev.map(quest => {
      if (quest.completed || quest.type !== 'purchase') return quest;
      const newProgress = user.ownedTitles.length + 1;
      const isCompleted = newProgress >= quest.target;
      
      if (isCompleted && !quest.completed) {
        setTimeout(() => {
          setUser(u => ({ ...u, balance: u.balance + quest.reward }));
          toast({
            title: '🎉 Задание выполнено!',
            description: `Получено ${quest.reward} ТитулКоинов за "${quest.name}"`,
          });
        }, 500);
      }

      return { ...quest, progress: newProgress, completed: isCompleted };
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

    setUser(prev => {
      const newMessageCount = prev.messageCount + 1;
      return { ...prev, messageCount: newMessageCount };
    });

    setQuests(prev => prev.map(quest => {
      if (quest.completed || quest.type !== 'chat') return quest;
      const newProgress = user.messageCount + 1;
      const isCompleted = newProgress >= quest.target;
      
      if (isCompleted && !quest.completed) {
        setTimeout(() => {
          setUser(u => ({ ...u, balance: u.balance + quest.reward }));
          toast({
            title: '🎉 Задание выполнено!',
            description: `Получено ${quest.reward} ТитулКоинов за "${quest.name}"`,
          });
        }, 500);
      }

      return { ...quest, progress: newProgress, completed: isCompleted };
    }));
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
              🐔 ЧИКЕНТИТУЛ
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
          <h1 className="text-3xl font-bold neon-glow">🐔 ЧИКЕНТИТУЛ</h1>
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
                    } ${active ? 'ring-2 ring-primary' : ''} border-2 ${!owned ? 'select-none' : ''}`}
                    onClick={() => handleTitleClick(title)}
                    style={{ userSelect: owned ? 'auto' : 'none', WebkitUserSelect: owned ? 'auto' : 'none' }}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center justify-between">
                        <span className={!owned ? 'blur-sm pointer-events-none' : ''}>{title.name}</span>
                        {owned && <Icon name="Check" className="text-green-500" />}
                      </CardTitle>
                      <CardDescription className={!owned ? 'select-none' : ''}>{title.description}</CardDescription>
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
                  Время на сайте: {formatTime(user.timeSpent)} • Сообщений: {user.messageCount} • Титулов куплено: {user.ownedTitles.length}
                </CardDescription>
              </CardHeader>
            </Card>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
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
                          {quest.type === 'time' && `${formatTime(quest.progress)} / ${formatTime(quest.target)}`}
                          {quest.type === 'chat' && `${quest.progress} / ${quest.target} сообщений`}
                          {quest.type === 'purchase' && `${quest.progress} / ${quest.target} титулов`}
                          {quest.type === 'balance' && `${quest.progress} / ${quest.target} монет`}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-primary">
                          <Icon name="Coins" className="h-4 w-4" />
                          <span>+{quest.reward}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
