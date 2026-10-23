import React, { useEffect, useRef, useState } from 'react';
import { Roshan, Map as DotaMap } from 'dotagsi';
import './roshan.scss';
import { getAssetURL } from '../../api/getAssetURL';

interface Props {
    roshan: Roshan | null;
    map: DotaMap;
    show: boolean;
}

const NUM_LABEL = ['', '1-Й', '2-Й', '3-Й', '4-Й', '5-Й', '6-Й', '7-Й', '8-Й'];

const secToClock = (s: number) => {
    const v = Math.max(0, Math.ceil(s));
    return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
};

const RoshanNotify = ({ roshan, map, show }: Props) => {
    // items_drop: ключи = слоты (item0, item1...), НАЗВАНИЯ предметов — в значениях
    const gsiDrops = roshan?.items_drop
        ? Object.values(roshan.items_drop).filter((v): v is string => !!v)
        : [];

    // Номер Рошана: из GSI-дропа/фазы, иначе 1
    const num = Math.min(8, Math.max(1, gsiDrops.length || (roshan?.spawn_phase ?? 1)));

    // Дроп: берём из GSI если есть, иначе выводим по номеру Рошана
    const dropByNum = (n: number): string[] => {
        const list = ['item_aegis'];
        if (n >= 2) list.push('item_cheese');
        if (n >= 3) list.push('item_aghanims_shard_roshan');
        if (n >= 4) list.push('item_refresher_shard');
        return list;
    };
    const dropKeys = gsiDrops.length > 0 ? gsiDrops : dropByNum(num);

    const state = (map as any).roshan_state as string | undefined;
    const endSeconds = (map as any).roshan_state_end_seconds as number | undefined;
    const alive = roshan?.alive ?? (state === 'alive');
    // respawn: показываем таймер, если рош мёртв и известно время
    const respawnTimer = !alive && endSeconds && endSeconds > 0 ? secToClock(endSeconds) : null;

    // Авто-показ: Рошана бьют, если он жив и его HP ниже максимума
    const hp = roshan?.health ?? 0;
    const maxHp = roshan?.max_health ?? 0;
    const underAttack = !!alive && maxHp > 0 && hp > 0 && hp < maxHp;

    // Показ: триггер (атака ИЛИ бинд) → видео проигрывается 2 раза → скрыть
    const PLAYS = 2;
    const trigger = show || underAttack;
    const wasTriggered = useRef(false);
    const [visible, setVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playCount = useRef(0);

    useEffect(() => {
        if (trigger && !wasTriggered.current) {
            wasTriggered.current = true;
            playCount.current = 0;
            setVisible(true);
            const v = videoRef.current;
            if (v) { try { v.currentTime = 0; v.play().catch(() => {}); } catch { /* noop */ } }
        } else if (!trigger) {
            wasTriggered.current = false; // сброс для следующей атаки
        }
    }, [trigger]);

    const handleEnded = () => {
        playCount.current += 1;
        if (playCount.current < PLAYS) {
            const v = videoRef.current;
            if (v) { try { v.currentTime = 0; v.play().catch(() => {}); } catch { /* noop */ } }
        } else {
            setVisible(false);
        }
    };

    return (
        <div className={`rosh_overlay ${visible ? '' : 'hide'}`}>
            <div className="rosh_card">
                <div className="rosh_art">
                    <video
                        ref={videoRef}
                        className="rosh_art_video"
                        src="./assets/dota2/roshan.webm"
                        muted playsInline
                        // ролик 720×720 (~1 МБ, был 2000×2000): грузим заранее, чтобы показ стартовал без задержки
                        preload="auto"
                        onEnded={handleEnded}
                        onError={e => { (e.target as HTMLVideoElement).style.display = 'none'; }}
                    />
                </div>

                <div className="rosh_info">
                    <div className="rosh_title_row">
                        <span className="rosh_title">{NUM_LABEL[num]} РОШАН</span>
                        {respawnTimer && <span className="rosh_timer">{respawnTimer}</span>}
                    </div>
                    <div className="rosh_drops">
                        {dropKeys.map((name) => (
                            <div className="rosh_drop_slot" key={name}>
                                <img
                                    src={getAssetURL(name, 'items')}
                                    alt=""
                                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// map/roshan — новые объекты на каждом тике GSI; перерисовка только при смене нужных полей
const roshSig = ({ roshan: r, map, show }: Props) =>
    `${show}|${r?.alive}|${r?.health}|${r?.max_health}|${r?.spawn_phase}|${JSON.stringify(r?.items_drop ?? null)}|` +
    `${(map as any).roshan_state}|${(map as any).roshan_state_end_seconds}`;

export default React.memo(RoshanNotify, (a, b) => roshSig(a) === roshSig(b));
