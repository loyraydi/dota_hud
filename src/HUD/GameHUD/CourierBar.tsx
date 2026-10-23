import React, { useEffect, useRef, useState } from 'react';
import { Player } from 'dotagsi';
import { getAssetURL } from '../../api/getAssetURL';
import './courier.scss';

interface Props {
    player: Player | null;
    show: boolean;
}

type CItem = { name: string; charges?: unknown };

const CourierBar = ({ player, show }: Props) => {
    const courier = player?.courier;
    const myId = (player as any)?.player_id ?? player?.player_slot;

    let items: CItem[] = [];
    if (courier?.alive) {
        items = (courier.items ?? []).filter(i => i.owner === myId && i.name && i.name !== 'empty');
        if (items.length === 0) {
            items = (courier.items ?? []).filter(i => i.name && i.name !== 'empty');
        }
    }

    const visible = show && items.length > 0;

    // держим последний непустой набор, чтобы контент не пропадал во время fade-out
    const [displayed, setDisplayed] = useState<CItem[]>([]);
    const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            if (clearTimer.current) { clearTimeout(clearTimer.current); clearTimer.current = null; }
            setDisplayed(items);
        } else {
            // очищаем контент только после завершения анимации скрытия
            if (clearTimer.current) clearTimeout(clearTimer.current);
            clearTimer.current = setTimeout(() => setDisplayed([]), 400);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, JSON.stringify(items.map(i => i.name))]);

    useEffect(() => () => { if (clearTimer.current) clearTimeout(clearTimer.current); }, []);

    const list = visible ? items : displayed;

    return (
        <div className={`courier_bar ${visible ? '' : 'hide'}`}>
            <img className="courier_icon" src={getAssetURL('item_courier', 'items')} alt="" />
            <span className="courier_arrow">›</span>
            <div className="courier_items">
                {list.slice(0, 9).map((it, i) => {
                    const charges = (it as any).charges ?? null;
                    const isRecipe = it.name.startsWith('item_recipe');
                    const src = isRecipe ? './assets/dota2/items/recipe.webp' : getAssetURL(it.name, 'items');
                    return (
                        <div className="courier_item" key={i}>
                            <img
                                src={src}
                                alt=""
                                onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                            />
                            {charges != null && charges !== '' && (
                                <span className="courier_charges">{String(charges)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Наблюдаемый игрок — новый объект на каждом тике GSI; перерисовываемся только при смене курьера
const courierSig = (p: Player | null) => {
    const c = p?.courier;
    if (!c) return '-';
    const id = (p as any)?.player_id ?? p?.player_slot;
    return `${id}|${c.alive}|${(c.items ?? []).map(i => `${i.name}:${i.owner}:${(i as any).charges ?? ''}`).join(',')}`;
};

export default React.memo(CourierBar, (a, b) => a.show === b.show && courierSig(a.player) === courierSig(b.player));
